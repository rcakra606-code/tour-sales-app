import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getDashboardSummary, getTourRegionStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", authenticate, getDashboardSummary);
router.get("/tour-region", authenticate, getTourRegionStats);

export default router;