import express from "express";
import { getExecutiveSummary, getMonthlyPerformance } from "../controllers/executiveReportController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", authenticate, getExecutiveSummary);
router.get("/monthly-performance", authenticate, getMonthlyPerformance);

export default router;
