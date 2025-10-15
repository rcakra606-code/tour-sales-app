// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const roleCheck = require("../middleware/roleCheck");

// 🔹 Semua role boleh melihat dashboard summary dan chart
router.get("/summary", roleCheck("super", "semi", "basic"), dashboardController.getSummary);
router.get("/charts", roleCheck("super", "semi", "basic"), dashboardController.getCharts);

module.exports = router;
