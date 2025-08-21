const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, default: 1 },
  assignedTo: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      qty: { type: Number },
    },
  ],
});

const receiptSchema = new mongoose.Schema(
  {
    total: { type: Number },
    items: [itemSchema],
    rawText: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", receiptSchema);
