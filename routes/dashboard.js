// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");

// Semua route dashboard harus pakai token
router.get("/", verifyToken, dashboardController.getDashboardSummary);

module.exports = router;
