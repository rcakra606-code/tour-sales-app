/**
 * ✅ Dashboard Routes
 * Semua endpoint di bawah ini membutuhkan autentikasi JWT.
 * Menyediakan data summary dan chart untuk tampilan dashboard.
 */

const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Middleware
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua route dashboard butuh login
router.use(authMiddleware);

// === Summary data untuk dashboard utama ===
router.get("/summary", dashboardController.getSummary);

// === Data untuk chart (sales, region, departure) ===
router.get("/charts", dashboardController.getCharts);

// === (Opsional) Tambahkan proteksi role jika butuh akses khusus ===
// router.get("/admin-only", roleCheck("super"), dashboardController.adminSummary);

module.exports = router;
