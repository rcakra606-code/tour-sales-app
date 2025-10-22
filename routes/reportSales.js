// ==========================================================
// 💹 Report Sales Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getSalesSummary,
  getSalesByStaff,
  getSalesTargetComparison,
  getSalesDetail,
} from "../controllers/reportSalesController.js";

const router = express.Router();

router.get("/summary", authenticate, getSalesSummary);
router.get("/staff", authenticate, getSalesByStaff);
router.get("/target", authenticate, getSalesTargetComparison);
router.get("/detail", authenticate, getSalesDetail);

export default router;