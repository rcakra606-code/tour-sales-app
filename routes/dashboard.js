// =====================================
// ✅ Dashboard Routes
// =====================================
const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboardController");

// Jalur dashboard data
router.get("/", controller.getDashboardData);

module.exports = router;
