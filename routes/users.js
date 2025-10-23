import express from "express";
import {
  getUsers,
  createUser,
  deleteUser,
  updateUser,
} from "../controllers/userController.js";
import {
  authenticate,
  authorizeAdmin,
  authorizeSemiAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Semua user bisa lihat data dirinya (nanti dikontrol dari controller)
router.get("/", authenticate, getUsers);

// Hanya admin yang bisa tambah dan hapus user
router.post("/", authenticate, authorizeAdmin, createUser);
router.delete("/:id", authenticate, authorizeAdmin, deleteUser);

// Admin & Semi-admin bisa update user
router.put("/:id", authenticate, authorizeSemiAdmin, updateUser);

export default router;