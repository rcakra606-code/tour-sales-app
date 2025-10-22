import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getDashboardSummary,
  getTourRegionData,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", authenticate, getDashboardSummary);
router.get("/tour-region", authenticate, getTourRegionData);

export default router;