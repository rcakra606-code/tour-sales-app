// ==========================================================
// 👥 Travel Dashboard Enterprise v5.3
// Users Management Routes (Admin only)
// ==========================================================
import express from "express";
import {
  getAllUsers,
  createUser,
  deleteUser,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleCheck } from "../middleware/roleCheck.js";

const router = express.Router();

// 👀 Get all users (admin only)
router.get("/", authMiddleware, roleCheck(["admin"]), getAllUsers);

// ➕ Create new user (admin only)
router.post("/", authMiddleware, roleCheck(["admin"]), createUser);

// ❌ Delete user (admin only)
router.delete("/:id", authMiddleware, roleCheck(["admin"]), deleteUser);

export default router;