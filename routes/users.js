/**
 * ==========================================================
 * 📁 routes/users.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Endpoint untuk modul User Management:
 * - Ambil semua user
 * - Tambah / edit user
 * - Hapus user berdasarkan username
 * ==========================================================
 */

import express from "express";
import {
  getUsers,
  createUser,
  deleteUser
} from "../controllers/userController.js";

const router = express.Router();

// 👥 Ambil semua data user
router.get("/", getUsers);

// ➕ Tambah atau edit user
router.post("/", createUser);

// ❌ Hapus user berdasarkan username
router.delete("/:username", deleteUser);

export default router;