/**
 * ==========================================================
 * 📁 routes/auth.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Rute untuk autentikasi user
 * - Login
 * - Verifikasi token JWT
 * ==========================================================
 */

import express from "express";
import { loginUser, verifyToken } from "../controllers/authController.js";

const router = express.Router();

// 🔐 Login user
router.post("/login", loginUser);

// 🔎 Verifikasi token login aktif
router.get("/verify", verifyToken);

export default router;