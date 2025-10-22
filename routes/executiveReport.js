// ==========================================================
// 🧭 Executive Report Routes — Travel Dashboard v5.4.5
// ==========================================================
import express from "express";
import {
  authenticate,
  authorizeManagement,
} from "../middleware/authMiddleware.js";
import {
  getExecutiveSummary,
  getMonthlyPerformance,
  getTourStatistics,
  getDocumentStatistics,
} from "../controllers/executiveReportController.js";

const router = express.Router();

// Route summary & statistik
router.get("/summary", authenticate, authorizeManagement, getExecutiveSummary);
router.get("/monthly-performance", authenticate, authorizeManagement, getMonthlyPerformance);
router.get("/tour-statistics", authenticate, authorizeManagement, getTourStatistics);
router.get("/document-summary", authenticate, authorizeManagement, getDocumentStatistics);

export default router;