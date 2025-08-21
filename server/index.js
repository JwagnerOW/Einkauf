const express = require("express");
const userRoutes = require("./routes/User.routes");
const receiptRoutes = require("./routes/Receipt.routes");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const cors = require("cors");

// erlaubt Requests vom Frontend
app.use(
  cors({
    origin: "http://localhost:5173", // Vite-Standardport
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// MongoDB-Verbindung
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/receiptdb", {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json()); // Für das Parsen von JSON-Daten im Body

// Routen

app.use("/users", userRoutes);
app.use("/receipts", receiptRoutes);

// Fehler-Middleware (um Fehler im Controller zu behandeln)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
