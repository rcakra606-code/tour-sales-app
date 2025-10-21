// routes/executiveReport.js
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getMonthlyPerformance,
  getSalesTargets,
  getProfitTrend,
} from "../controllers/executiveReportController.js";

const router = express.Router();

// Semua route executive butuh autentikasi
router.get("/monthly-performance", authenticate, getMonthlyPerformance);
router.get("/sales-targets", authenticate, getSalesTargets);
router.get("/profit-trend", authenticate, getProfitTrend);

export default router;