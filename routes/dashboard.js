// routes/dashboard.js
const express = require("express");
const path = require("path");
const router = express.Router();

const controllerPath = path.join(__dirname, "..", "controllers", "dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

let dashboardController;
try {
  dashboardController = require(controllerPath);
  console.log("✅ Dashboard route -> controller loaded:", controllerPath);
} catch (err) {
  console.error("❌ Dashboard controller not found:", controllerPath, err.message);
  router.get("*", (_, res) => res.status(500).json({ error: "Dashboard controller not found." }));
  module.exports = router;
  return;
}

router.get("/", authMiddleware, dashboardController.getStats);
router.get("/summary", authMiddleware, dashboardController.getSummary ? dashboardController.getSummary : (req, res) => res.status(404).json({ message: "summary not implemented" }));

module.exports = router;
