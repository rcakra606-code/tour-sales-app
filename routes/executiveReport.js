// ==========================================================
// 📊 Executive Report Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getOverview,
  getStaffPerformance,
  getRegionPerformance,
  getMonthlyPerformance,
} from "../controllers/executiveReportController.js";

const router = express.Router();

// Semua route hanya bisa diakses oleh admin & semiadmin
router.get("/overview", authenticate, authorize(["admin", "semiadmin"]), getOverview);
router.get("/performance", authenticate, authorize(["admin", "semiadmin"]), getStaffPerformance);
router.get("/region-performance", authenticate, authorize(["admin", "semiadmin"]), getRegionPerformance);
router.get("/monthly-performance", authenticate, authorize(["admin", "semiadmin"]), getMonthlyPerformance);

export default router;