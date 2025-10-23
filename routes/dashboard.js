import express from "express";
import { getDashboardSummary, getTourRegionStats, getMonthlyPerformance } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/summary", authenticate, getDashboardSummary);
router.get("/tour-region", authenticate, getTourRegionStats);
router.get("/monthly-performance", authenticate, getMonthlyPerformance);
export default router;