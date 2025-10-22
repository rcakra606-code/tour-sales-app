// ==========================================================
// 👥 User Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// Hanya admin & semiadmin yang bisa melihat data user
router.get("/", authenticate, authorize(["admin", "semiadmin"]), getUsers);

// Hanya admin yang bisa menambah / menghapus user
router.post("/", authenticate, authorize(["admin"]), createUser);
router.delete("/:id", authenticate, authorize(["admin"]), deleteUser);

// Admin & semiadmin bisa update user
router.put("/:id", authenticate, authorize(["admin", "semiadmin"]), updateUser);

export default router;