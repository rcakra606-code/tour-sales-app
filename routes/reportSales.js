// ==========================================================
// 💹 Sales Report Routes — v5.4.6
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

router.get("/", authenticate, authorizeManagement, getAllSalesReport);
router.get("/staff/:staff_name", authenticate, getSalesByStaff);
router.get("/summary", authenticate, authorizeManagement, getSalesSummary);
router.get("/export", authenticate, authorizeManagement, exportSalesReport);

export default router;