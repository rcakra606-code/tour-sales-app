/**
 * routes/regions.js
 * Travel Dashboard Enterprise v5.0
 * ============================================
 * Endpoint CRUD region untuk form Region Management.
 */

import express from "express";
import {
  getRegions,
  getRegionById,
  createRegion,
  updateRegion,
  deleteRegion,
} from "../controllers/regionController.js";
import { verifyToken } from "../middleware/auth.js";
import { checkRole } from "../middleware/roleCheck.js";

const router = express.Router();

// Semua endpoint pakai verifikasi login
router.use(verifyToken);

// GET all
router.get("/", getRegions);

// GET single region
router.get("/:id", getRegionById);

// CREATE (Admin / Super)
router.post("/", checkRole(["admin", "super"]), createRegion);

// UPDATE
router.put("/:id", checkRole(["admin", "super"]), updateRegion);

// DELETE
router.delete("/:id", checkRole(["admin", "super"]), deleteRegion);

export default router;