// services/parseReceipt.js
//
// Ziel:
// - Items aus OCR-Zeilen extrahieren: { name, qty, price }
// - "x n" Mengen erkennen (auch ohne Leerzeichen: "1,79x 2")
// - Pfand / Pfandrückgabe / Rabatt / Preisvorteil korrekt (Vorzeichen)
// - "zu zahlen <betrag>" erkennen und als total übernehmen
// - Fallback: total = Summe(Positionen)
//
function normalizePrice(str) {
  // "1.234,56" | "1 234,56" | "1,99" | "-0,20"  ->  number
  const cleaned = str.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function parseReceiptText(text) {
  if (!text || typeof text !== "string") return { items: [], total: undefined };

  const lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const items = [];

  // Regex-Bausteine
  const priceRe = /-?\d{1,3}(?:[.\s]\d{3})*,\d{2}/g; // findet alle Preise mit Komma
  const firstPriceRe = /-?\d{1,3}(?:[.\s]\d{3})*,\d{2}/; // erster Preis
  const qtyRe = /x\s*(\d+)/i; // "x 2" (auch "x2" wird durch trim bei OCR oft "x 2")
  const taxSuffixRe = /\s+[AB]$/i; // Steuerkennung am Zeilenende
  const endJunkRe = /\s+[AB]\s*$/i;

  // Hilfsfunktionen
  const isHeaderFooter = (line) =>
    /^(lidl|eur|mwst|summe|tse|ust|kreditkarte|gesamter|www\.|einkauf getätigt|details zur filiale)/i.test(
      line
    ) ||
    /^k-u-n-d-e-n-b-e-l-e-g/i.test(line) ||
    /^bezahlung/i.test(line) ||
    /^\*\* autorisierung erfolgt \*\*/i.test(line) ||
    /^signaturzähler/i.test(line) ||
    /transaktionsnummer|seriennr\.|autorisierungs/i.test(line);

  const isDiscount = (line) => /rabatt|preisvorteil/i.test(line);
  const isDeposit = (line) =>
    /\bpfand\b/i.test(line) && !/pfandrückgabe/i.test(line);
  const isDepositReturn = (line) => /pfandrückgabe/i.test(line);

  let parsedTotal; // aus "zu zahlen …"

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s{2,}/g, " ").trim();

    // Total: "zu zahlen 114,11"
    if (/zu\s*zahlen/i.test(line)) {
      const m = line.match(firstPriceRe);
      if (m) {
        const v = normalizePrice(m[0]);
        if (Number.isFinite(v)) parsedTotal = v;
      }
      continue;
    }

    // offensichtliche Kopf/Fuß/Meta-Zeilen überspringen
    if (isHeaderFooter(line)) continue;

    // Preise extrahieren
    const priceMatches = line.match(priceRe);
    if (!priceMatches) continue;

    // Name = alles vor dem ersten Preis
    const firstMatch = line.match(firstPriceRe);
    if (!firstMatch) continue;

    let namePart = line.slice(0, firstMatch.index).trim();
    namePart = namePart.replace(endJunkRe, "").trim();
    if (!namePart) namePart = "Unbekannt";

    // Menge erkennen
    const qtyMatch = line.match(qtyRe);
    const qty = qtyMatch ? Number(qtyMatch[1]) : 1;

    // Preise interpretieren
    // Heuristik:
    // - Bei "x n" und >= 2 Preisen ist der letzte Preis oft der Zeilen-Gesamtpreis.
    // - Sonst nimm den ersten Preis als (Einzel-)Preis.
    const unitCandidate = normalizePrice(priceMatches[0]);
    const lastCandidate = normalizePrice(priceMatches[priceMatches.length - 1]);

    // Flags für Sonderfälle
    const deposit = isDeposit(line);
    const depositReturn = isDepositReturn(line);
    const discount = isDiscount(line);

    let price = unitCandidate; // per default: erster Preis
    let finalQty = qty;

    // Bei Pfand-Zeilen (z.B. "Pfand 0,25 EM 0,25 x 12 3,00 B"):
    // - Wenn Menge vorhanden und ein kleiner Preis (~0,25) sowie am Ende ein Gesamtpreis (~3,00),
    //   dann nimm 0,25 als price und qty = 12.
    if (deposit) {
      if (qty > 1 && Number.isFinite(unitCandidate)) {
        price = unitCandidate;
        finalQty = qty;
      } else if (Number.isFinite(lastCandidate)) {
        // Fallback: treat as total for this line
        price = lastCandidate;
        finalQty = 1;
      }
    }

    // Pfandrückgabe: immer negative Summe
    if (depositReturn) {
      if (qty > 1 && Number.isFinite(unitCandidate)) {
        price = -Math.abs(unitCandidate);
        finalQty = qty;
      } else if (Number.isFinite(lastCandidate)) {
        price = -Math.abs(lastCandidate);
        finalQty = 1;
      } else if (Number.isFinite(unitCandidate)) {
        price = -Math.abs(unitCandidate);
        finalQty = 1;
      }
    }

    // Rabatt / Preisvorteil: negative Preise
    if (discount) {
      // Falls Zeile wie "Rabattaktion -0,20" → firstPriceRe ist schon negativ, gut.
      // Falls mehrere Preise, nimm letzten (größere Chance, dass es der Betrag ist)
      const discountPrice = Number.isFinite(lastCandidate)
        ? lastCandidate
        : Number.isFinite(unitCandidate)
        ? unitCandidate
        : NaN;
      if (Number.isFinite(discountPrice)) {
        price = discountPrice; // ist ggf. schon negativ
        finalQty = 1;
      }
      // Sicherstellen, dass negativ:
      price = -Math.abs(price);
    }

    // Allgemeiner Fall mit "x n" und zwei Preisen: wenn last ≈ unit * qty, behalte unit
    if (!deposit && !depositReturn && !discount) {
      if (
        qty > 1 &&
        Number.isFinite(unitCandidate) &&
        Number.isFinite(lastCandidate)
      ) {
        const expected = unitCandidate * qty;
        if (Math.abs(lastCandidate - expected) <= 0.03) {
          price = unitCandidate; // Einzelpreis
          finalQty = qty;
        } else {
          // Unklare Lage: nimm den letzten (vermutlich Zeilen-Gesamtpreis) und qty=1
          price = lastCandidate;
          finalQty = 1;
        }
      }
    }

    if (!Number.isFinite(price)) continue;

    items.push({
      name: namePart,
      qty: finalQty > 0 ? finalQty : 1,
      price: Number(price.toFixed(2)),
    });
  }

  // Fallback-/Abgleich-Total
  const computed = Number(
    items.reduce((s, it) => s + it.price * (it.qty || 1), 0).toFixed(2)
  );

  // Wenn "zu zahlen" gefunden → das ist die Wahrheit
  let total = parsedTotal;
  if (!Number.isFinite(total)) {
    total = computed;
  }

  return { items, total };
}

module.exports = { parseReceiptText };
