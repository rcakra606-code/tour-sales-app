// ==========================================================
// 📊 Travel Dashboard Enterprise v5.3
// Dashboard Routes (JWT + Role-Based Access)
// ==========================================================
import express from "express";
import {
  getDashboardSummary,
  getSalesProfitTrend,
  getTourRegionData,
} from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

// 📈 Summary data (semua role)
router.get("/summary", authMiddleware, roleCheck(["staff", "semiadmin", "admin"]), getDashboardSummary);

// 📉 Sales vs Profit Trend
router.get("/sales-profit-trend", authMiddleware, roleCheck(["semiadmin", "admin"]), getSalesProfitTrend);

// 🌍 Tour Region Chart Data
router.get("/tour-region", authMiddleware, roleCheck(["staff", "semiadmin", "admin"]), getTourRegionData);

export default router;