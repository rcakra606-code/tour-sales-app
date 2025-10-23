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

router.get("/", authenticate, authorize(["admin", "semiadmin"]), getTargets);
router.get("/:staff_name", authenticate, getStaffTarget);
router.post("/", authenticate, authorize(["admin", "semiadmin"]), createTarget);
router.put("/:id", authenticate, authorize(["admin", "semiadmin"]), updateTarget);
router.delete("/:id", authenticate, authorize(["admin"]), deleteTarget);

export default router;
