import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getStaffPerformance,
  getTargetProgress,
  getMonthlyPerformance
} from "../controllers/executiveReportController.js";

const router = express.Router();

router.get("/staff-performance", authenticate, getStaffPerformance);
router.get("/target-progress", authenticate, getTargetProgress);
router.get("/monthly-performance", authenticate, getMonthlyPerformance);

export default router;