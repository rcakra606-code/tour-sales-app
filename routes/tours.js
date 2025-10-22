// ==========================================================
// 🧳 Tours Management Routes — v5.4.6
// ==========================================================
import express from "express";
import {
  authenticate,
  authorizeManagement,
} from "../middleware/authMiddleware.js";
import {
  createTour,
  updateTour,
  deleteTour,
  getTours,
} from "../controllers/tourController.js";

const router = express.Router();

router.get("/", authenticate, getTours);
router.post("/", authenticate, authorizeManagement, createTour);
router.put("/:id", authenticate, authorizeManagement, updateTour);
router.delete("/:id", authenticate, authorizeManagement, deleteTour);

export default router;