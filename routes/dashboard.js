// routes/dashboard.js
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getDashboardSummary,
  getStaffProgress,
  getTourRegion,
} from "../controllers/dashboardController.js";

const router = express.Router();

// Semua route dashboard butuh autentikasi
router.get("/summary", authenticate, getDashboardSummary);
router.get("/staff-progress", authenticate, getStaffProgress);
router.get("/tour-region", authenticate, getTourRegion);

export default router;