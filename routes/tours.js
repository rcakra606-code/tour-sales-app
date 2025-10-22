// ==========================================================
// ✈️ Tour Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getTours,
  createTour,
  updateTour,
  deleteTour,
} from "../controllers/tourController.js";

const router = express.Router();

// Semua user login bisa lihat data tour
router.get("/", authenticate, getTours);

// Staff, SemiAdmin, dan Admin bisa menambah tour
router.post("/", authenticate, authorize(["staff", "semiadmin", "admin"]), createTour);

// SemiAdmin & Admin bisa edit
router.put("/:id", authenticate, authorize(["semiadmin", "admin"]), updateTour);

// Hanya Admin bisa hapus
router.delete("/:id", authenticate, authorize(["admin"]), deleteTour);

export default router;