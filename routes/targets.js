// ==========================================================
// 🎯 Target Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  upsertTarget,
  getAllTargets,
  getTargetByStaffMonth,
  deleteTarget,
} from "../controllers/targetController.js";

const router = express.Router();

// Simpan / update target
router.post("/", authenticate, upsertTarget);

// Ambil semua target
router.get("/", authenticate, getAllTargets);

// Ambil target berdasarkan staff & bulan
router.get("/:staff/:month", authenticate, getTargetByStaffMonth);

// Hapus target
router.delete("/:id", authenticate, deleteTarget);

export default router;