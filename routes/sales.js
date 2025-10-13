// routes/sales.js
const express = require("express");
const router = express.Router();
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

const controllerPath = path.join(__dirname, "../controllers/salesController");

let salesController;
try {
  salesController = require(controllerPath);
  console.log("✅ Sales route terhubung ke controller:", controllerPath);
} catch (err) {
  console.error("❌ Sales controller not found:", err.message);
  router.get("*", (_, res) => res.status(500).json({ error: "Sales controller not found." }));
  module.exports = router;
  return;
}

// ===== Routes =====
router.get("/", authMiddleware, salesController.getAllSales);
router.post("/", authMiddleware, salesController.createSale);
router.delete("/:id", authMiddleware, salesController.deleteSale);

module.exports = router;
