// ==========================================================
// 📊 Report Tour Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getTourSummary,
  getTourByRegion,
  getTourByStatus,
  getTourDetails,
} from "../controllers/reportTourController.js";

const router = express.Router();

router.get("/summary", authenticate, getTourSummary);
router.get("/region", authenticate, getTourByRegion);
router.get("/status", authenticate, getTourByStatus);
router.get("/detail", authenticate, getTourDetails);

export default router;