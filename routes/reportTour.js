// ==========================================================
// ✈️ Tour Report Routes — v5.4.6
// ==========================================================
import express from "express";
import {
  authenticate,
  authorizeManagement,
} from "../middleware/authMiddleware.js";
import {
  getAllTours,
  getToursByRegion,
  exportTourReport,
} from "../controllers/reportTourController.js";

const router = express.Router();

router.get("/", authenticate, authorizeManagement, getAllTours);
router.get("/region/:region", authenticate, getToursByRegion);
router.get("/export", authenticate, authorizeManagement, exportTourReport);

export default router;