/**
 * ✅ Dashboard Routes
 * Semua endpoint di bawah ini membutuhkan autentikasi JWT.
 * Menyediakan data summary dan chart untuk tampilan dashboard.
 */

const express = require("express");
const router = express.Router();

// Controller
const dashboardController = require("../controllers/dashboardController");

// Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua route dashboard butuh login
router.use(authMiddleware);

// === Summary data untuk dashboard utama ===
router.get("/summary", dashboardController.getSummary);

// === Data untuk chart (sales, region, departure) ===
router.get("/charts", dashboardController.getCharts);
router.get("/sales-overview", dashboardController.getSalesOverview);
router.get("/report", dashboardController.exportReport || ((req, res) => {
  res.status(501).json({ message: "Export report belum diimplementasikan." });
}));

// === (Opsional) Tambahkan proteksi role jika butuh akses khusus ===
// router.get("/admin-only", roleCheck("super"), dashboardController.adminSummary);

module.exports = router;
