import { useMemo, useState } from "react";
import type { Receipt, User } from "../types";

function calcShares(receipt: Receipt, users: User[]) {
  // Anteil je User anhand assignedTo; wenn assignedTo leer -> alle teilen nach qty
  const totals: Record<string, number> = Object.fromEntries(
    users.map((u) => [u._id, 0])
  );
  for (const it of receipt.items) {
    const totalLine = Number(it.price) * (it.qty ?? 1);
    const assignedSum = (it.assignedTo || []).reduce((s, a) => s + a.qty, 0);

    if (assignedSum <= 0) {
      // alle teilen gleich nach qty
      const perUser = totalLine / users.length;
      for (const u of users) totals[u._id] += perUser;
    } else {
      for (const a of it.assignedTo) {
        const frac = a.qty / assignedSum;
        totals[a.user] = (totals[a.user] ?? 0) + totalLine * frac;
      }
    }
  }
  return totals; // userId -> €-Anteil
}

function settle(balances: Record<string, number>) {
  // balances: bezahlt - schuld → positive bekommen Geld, negative zahlen
  const debtors = Object.entries(balances)
    .filter(([, v]) => v < -0.01)
    .map(([u, v]) => ({ u, amt: -v }))
    .sort((a, b) => a.amt - b.amt);
  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 0.01)
    .map(([u, v]) => ({ u, amt: v }))
    .sort((a, b) => b.amt - a.amt);
  const tx: { from: string; to: string; amount: number }[] = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    tx.push({
      from: debtors[i].u,
      to: creditors[j].u,
      amount: Math.round(pay * 100) / 100,
    });
    debtors[i].amt -= pay;
    creditors[j].amt -= pay;
    if (debtors[i].amt <= 0.01) i++;
    if (creditors[j].amt <= 0.01) j++;
  }
  return tx;
}

export default function SettlementPanel({
  receipt,
  users,
}: {
  receipt: Receipt;
  users: User[];
}) {
  const [paid, setPaid] = useState<Record<string, number>>(
    Object.fromEntries(users.map((u) => [u._id, 0]))
  );

  const shares = useMemo(() => calcShares(receipt, users), [receipt, users]);

  const balances = useMemo(() => {
    const obj: Record<string, number> = {};
    for (const u of users)
      obj[u._id] = (paid[u._id] || 0) - (shares[u._id] || 0);
    return obj; // >0 heißt: bekommt; <0 heißt: zahlt
  }, [paid, shares, users]);

  const tx = useMemo(() => settle(balances), [balances]);

  const name = (id: string) => users.find((u) => u._id === id)?.name || id;

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Berechnen</h3>
      <p>Wer hat wie viel bezahlt?</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          maxWidth: 600,
        }}
      >
        {users.map((u) => (
          <label
            key={u._id}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <span style={{ width: 120 }}>{u.name}</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={paid[u._id] ?? 0}
              onChange={(e) =>
                setPaid((prev) => ({
                  ...prev,
                  [u._id]: Number(e.target.value || 0),
                }))
              }
            />
            <span>€</span>
          </label>
        ))}
      </div>

      <h4 style={{ marginTop: 12 }}>Ausgleich</h4>
      {!tx.length && <p>Alles ausgeglichen 🎉</p>}
      {!!tx.length && (
        <ul>
          {tx.map((t, i) => (
            <li key={i}>
              {name(t.from)} → {name(t.to)}: {t.amount.toFixed(2)} €
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
