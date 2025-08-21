const Receipt = require("../models/Receipt.model");
const { ocrImage } = require("../services/ocrClient");
const { parseReceiptText } = require("../services/parseReceipt.js");

// Alle Receipts abrufen
exports.getReceipt = async (req, res, next) => {
  try {
    const receipts = await Receipt.find();
    res.status(200).json(receipts);
  } catch (error) {
    next(error);
  }
};

// Ein Receipt nach ID abrufen
exports.getReceiptById = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }
    res.status(200).json(receipt);
  } catch (error) {
    next(error);
  }
};

// Neues Receipt erstellen
exports.createReceipt = async (req, res, next) => {
  try {
    const receipt = new Receipt(req.body);
    await receipt.save();
    res.status(201).json(receipt);
  } catch (error) {
    next(error);
  }
};

// Receipt aktualisieren
exports.updateReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }
    res.status(200).json(receipt);
  } catch (error) {
    next(error);
  }
};

// Receipt löschen
exports.deleteReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }
    res.status(200).json({ message: "Receipt deleted" });
  } catch (error) {
    next(error);
  }
};

exports.createFromImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const rawText = await ocrImage(req.file.path);
    const { items, total } = parseReceiptText(rawText);

    // optional: Gesamtsumme berechnen, falls nicht gefunden
    const computedTotal = items.reduce(
      (s, it) => s + it.price * (it.qty || 1),
      0
    );
    const finalTotal =
      typeof total === "number" ? total : Number(computedTotal.toFixed(2));

    const receipt = await Receipt.create({
      total: finalTotal,
      items,
      rawText,
    });

    return res.status(201).json(receipt);
  } catch (err) {
    next(err);
  }
};

// Debug: Parser nur mit Text testen
exports.createFromText = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });
    const { items, total } = parseReceiptText(text);
    const computedTotal = items.reduce(
      (s, it) => s + it.price * (it.qty || 1),
      0
    );
    const finalTotal =
      typeof total === "number" ? total : Number(computedTotal.toFixed(2));

    const receipt = await Receipt.create({
      total: finalTotal,
      items,
      rawText: text,
    });
    res.status(201).json(receipt);
  } catch (e) {
    next(e);
  }
};
