// routes/dashboard.js
const express = require("express");
const router = express.Router();
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

const controllerPath = path.join(__dirname, "../controllers/dashboardController");

let dashboardController;
try {
  dashboardController = require(controllerPath);
  console.log("✅ Dashboard route terhubung ke controller:", controllerPath);
} catch (err) {
  console.error("❌ Dashboard controller not found:", err.message);
  router.get("*", (_, res) => res.status(500).json({ error: "Dashboard controller not found." }));
  module.exports = router;
  return;
}

// ===== Routes =====
router.get("/", authMiddleware, dashboardController.getDashboardStats);

module.exports = router;
