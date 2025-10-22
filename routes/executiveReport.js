// ==========================================================
// 📊 Executive Dashboard Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getExecutiveSummary,
  getMonthlyPerformance,
  getTourStatistics,
  getDocumentStatistics,
  getStaffPerformance,
} from "../controllers/executiveReportController.js";

const router = express.Router();

// Ringkasan utama
router.get("/summary", authenticate, getExecutiveSummary);

// Statistik bulanan (sales/profit)
router.get("/monthly-performance", authenticate, getMonthlyPerformance);

// Statistik tour per region
router.get("/tour-statistics", authenticate, getTourStatistics);

// Statistik dokumen (kilat/biasa)
router.get("/document-summary", authenticate, getDocumentStatistics);

// Statistik per staff (target vs realisasi)
router.get("/staff-performance", authenticate, getStaffPerformance);

export default router;