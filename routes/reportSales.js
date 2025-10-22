// ==========================================================
// 💹 Report Sales Routes — Travel Dashboard Enterprise v5.4.5
// ==========================================================
// Endpoint utama laporan penjualan dan profit per staff
// Terintegrasi dengan dashboard, executive report, dan targets
// ==========================================================

import express from "express";
import {
  authenticate,
  authorizeManagement,
} from "../middleware/authMiddleware.js";
import {
  getAllSalesReport,
  getSalesByStaff,
  getSalesSummary,
  exportSalesReport,
} from "../controllers/reportSalesController.js";

const router = express.Router();

// ==========================================================
// 🧭 ROUTES
// ==========================================================

// 🔹 GET /api/report/sales
// Ambil seluruh laporan penjualan (Admin & SemiAdmin)
router.get("/", authenticate, authorizeManagement, async (req, res) => {
  await getAllSalesReport(req, res);
});

// 🔹 GET /api/report/sales/staff/:staff_name
// Ambil laporan penjualan per staff
router.get("/staff/:staff_name", authenticate, async (req, res) => {
  await getSalesByStaff(req, res);
});

// 🔹 GET /api/report/sales/summary
// Ringkasan target vs pencapaian (per bulan)
router.get("/summary", authenticate, authorizeManagement, async (req, res) => {
  await getSalesSummary(req, res);
});

// 🔹 GET /api/report/sales/export
// Export data sales report ke CSV/Excel
router.get("/export", authenticate, authorizeManagement, async (req, res) => {
  await exportSalesReport(req, res);
});

// ==========================================================
// 🚀 EXPORT ROUTER
// ==========================================================
export default router;