import express from "express";
import { getRegions, createRegion, deleteRegion } from "../controllers/regionController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", authenticate, getRegions);
router.post("/", authenticate, createRegion);
router.delete("/:id", authenticate, deleteRegion);
export default router;