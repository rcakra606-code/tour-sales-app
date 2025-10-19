/**
 * ==========================================================
 * routes/executiveReport.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Summary laporan eksekutif (filter bulan & tahun)
 * ✅ Export Excel laporan eksekutif
 * ✅ Cache management
 * ✅ Middleware auth & role
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const execController = require("../controllers/executiveReportController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// ============================================================
// 📊 GET /api/executive/summary
// Ambil summary performa staff (dengan filter bulan & tahun)
// ============================================================
router.get(
  "/summary",
  verifyToken,
  roleCheck(["super", "semi"]),
  execController.getExecutiveSummary
);

// ============================================================
// 📤 GET /api/executive/export
// Export laporan eksekutif ke Excel (.xlsx)
// ============================================================
router.get(
  "/export",
  verifyToken,
  roleCheck(["super", "semi"]),
  execController.exportExecutiveReport
);

// ============================================================
// 🧹 DELETE /api/executive/cache
// Hapus cache laporan eksekutif
// ============================================================
router.delete(
  "/cache",
  verifyToken,
  roleCheck(["super"]),
  execController.clearExecutiveCache
);

// ============================================================
// 🕒 GET /api/executive/cache/status
// Cek status cache laporan eksekutif
// ============================================================
router.get(
  "/cache/status",
  verifyToken,
  roleCheck(["super", "semi"]),
  execController.getCacheStatus
);

module.exports = router;
