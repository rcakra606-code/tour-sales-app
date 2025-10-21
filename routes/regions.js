// ==========================================================
// 🌍 Travel Dashboard Enterprise v5.3
// Regions Routes (Admin & SemiAdmin)
// ==========================================================
import express from "express";
import {
  getAllRegions,
  createRegion,
  deleteRegion,
} from "../controllers/regionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

// 📋 Get all regions
router.get("/", authMiddleware, roleCheck(["staff", "semiadmin", "admin"]), getAllRegions);

// ➕ Add new region (semiadmin, admin)
router.post("/", authMiddleware, roleCheck(["semiadmin", "admin"]), createRegion);

// ❌ Delete region (admin only)
router.delete("/:id", authMiddleware, roleCheck(["admin"]), deleteRegion);

export default router;