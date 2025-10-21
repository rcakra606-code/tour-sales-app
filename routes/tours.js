// ==========================================================
// 🚐 Travel Dashboard Enterprise v5.3
// Tours Routes (JWT + Role-Based Access Control)
// ==========================================================
import express from "express";
import {
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
} from "../controllers/tourController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

// 📋 Get all tours (accessible by all roles)
router.get("/", authMiddleware, roleCheck(["staff", "semiadmin", "admin"]), getAllTours);

// ➕ Create new tour (staff, semiadmin, admin)
router.post("/", authMiddleware, roleCheck(["staff", "semiadmin", "admin"]), createTour);

// ✏️ Update existing tour (semiadmin, admin)
router.put("/:id", authMiddleware, roleCheck(["semiadmin", "admin"]), updateTour);

// ❌ Delete tour (admin only)
router.delete("/:id", authMiddleware, roleCheck(["admin"]), deleteTour);

export default router;