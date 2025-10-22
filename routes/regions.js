// ==========================================================
// 🌍 Region Management Routes — v5.4.6
// ==========================================================
import express from "express";
import {
  authenticate,
  authorizeAdmin,
} from "../middleware/authMiddleware.js";
import {
  getAllRegions,
  createRegion,
  deleteRegion,
} from "../controllers/regionController.js";

const router = express.Router();

router.get("/", authenticate, getAllRegions);
router.post("/", authenticate, authorizeAdmin, createRegion);
router.delete("/:id", authenticate, authorizeAdmin, deleteRegion);

export default router;