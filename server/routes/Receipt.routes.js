const express = require("express"); // Import von Express
const multer = require("multer");
const path = require("path");
const receiptController = require("../controllers/Receipt.controller"); // Import der Controller-Methoden
const router = express.Router(); // Erstellen eines neuen Router-Objekts

router.get("/", receiptController.getReceipt);
router.get("/:id", receiptController.getReceiptById);
router.post("/", receiptController.createReceipt);
router.put("/:id", receiptController.updateReceipt);
router.delete("/:id", receiptController.deleteReceipt);
// routes/receipt.routes.js

const {
  createFromImage,
  createFromText,
} = require("../controllers/Receipt.controller");

const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

router.post("/image", upload.single("file"), createFromImage); // Feldname: file
router.post("/text", express.json(), createFromText);

router.put("/:receiptId/items/:itemId/assign", async (req, res) => {
  const { assignedTo } = req.body; // [{ user: "ObjectId", qty: 1 }, ...]

  const receipt = await Receipt.findById(req.params.receiptId);
  if (!receipt) return res.status(404).json({ message: "Receipt not found" });

  const item = receipt.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  item.assignedTo = assignedTo;
  await receipt.save();

  res.json(item);
});

// PUT /receipts/:receiptId/items/:itemId/assign
router.put("/:receiptId/items/:itemId/assign", async (req, res, next) => {
  try {
    const { receiptId, itemId } = req.params;
    const { assignedTo } = req.body; // [{ user, qty }]

    const receipt = await Receipt.findById(receiptId);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    const item = receipt.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.assignedTo = assignedTo;
    await receipt.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
