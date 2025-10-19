/**
 * ==========================================================
 * 📁 routes/profile.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Menangani profil user & perubahan password
 * ==========================================================
 */

import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updatePassword,
} from "../controllers/profileController.js";

const router = express.Router();

// GET /api/profile/me → Ambil profil user login
router.get("/me", authMiddleware, getProfile);

// PUT /api/profile/password → Ganti password user login
router.put("/password", authMiddleware, updatePassword);

export default router;