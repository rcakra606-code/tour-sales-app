// ==========================================================
// 🎯 Target Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import {
  getTargets,
  createTarget,
  updateTarget,
  deleteTarget,
  getStaffTarget,
} from "../controllers/targetController.js";

const router = express.Router();

router.get("/", authenticate, authorizeAdmin, getTargets);
router.get("/:staff_name", authenticate, getStaffTarget);
router.post("/", authenticate, authorizeAdmin, createTarget);
router.put("/:id", authenticate, authorizeAdmin, updateTarget);
router.delete("/:id", authenticate, authorizeAdmin, deleteTarget);

export default router;
