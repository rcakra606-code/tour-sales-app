// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua route dashboard butuh login
router.use(authMiddleware);

// === Summary data untuk dashboard utama ===
router.get("/summary", dashboardController.getSummary);

// === Data untuk chart (sales, region, departure) ===
router.get("/charts", dashboardController.getCharts);

module.exports = router;
