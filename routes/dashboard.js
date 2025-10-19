/**
 * ==========================================================
 * routes/dashboard.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Ringkasan dashboard utama
 * ✅ Data chart bulanan
 * ✅ Top staff (untuk executive dashboard)
 * ✅ Middleware auth
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");

// ============================================================
// 📊 GET /api/dashboard/summary
// Ringkasan global dashboard utama
// ============================================================
router.get("/summary", verifyToken, dashboardController.getDashboardSummary);

// ============================================================
// 📈 GET /api/dashboard/chart-data
// Data untuk grafik sales & profit bulanan
// ============================================================
router.get("/chart-data", verifyToken, dashboardController.getChartData);

// ============================================================
// 🧑‍💼 GET /api/dashboard/top-staff
// Top 10 staff berdasarkan total sales & profit
// (dapat difilter ?month=&year=)
// ============================================================
router.get("/top-staff", verifyToken, dashboardController.getTopStaff);

module.exports = router;
