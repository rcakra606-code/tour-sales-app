import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import {
  getRegions,
  createRegion,
  updateRegion,
  deleteRegion,
} from "../controllers/regionController.js";

const router = express.Router();

router.get("/", authenticate, getRegions);
router.post("/", authenticate, authorizeAdmin, createRegion);
router.put("/:id", authenticate, authorizeAdmin, updateRegion);
router.delete("/:id", authenticate, authorizeAdmin, deleteRegion);

export default router;