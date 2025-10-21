// ==========================================================
// 💰 Travel Dashboard Enterprise v5.3
// Sales Routes (JWT + Role-Based Access Control)
// ==========================================================
import express from "express";
import {
  getAllSales,
  createSale,
  deleteSale,
  getAllTargets,
  createTarget,
} from "../controllers/salesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

// 📊 Get all sales
router.get("/", authMiddleware, roleCheck(["staff", "semiadmin", "admin"]), getAllSales);

// ➕ Create sales record
router.post("/", authMiddleware, roleCheck(["semiadmin", "admin"]), createSale);

// ❌ Delete sales (admin only)
router.delete("/:id", authMiddleware, roleCheck(["admin"]), deleteSale);

// 🎯 Get all targets (semiadmin & admin)
router.get("/targets", authMiddleware, roleCheck(["semiadmin", "admin"]), getAllTargets);

// ➕ Create target
router.post("/targets", authMiddleware, roleCheck(["semiadmin", "admin"]), createTarget);

export default router;