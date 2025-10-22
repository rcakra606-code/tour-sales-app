// ==========================================================
// 🔐 Auth Routes — Travel Dashboard Enterprise v5.4.8
// ==========================================================

import express from "express";
import { login, verifyToken, register } from "../controllers/authController.js";

const router = express.Router();

// 🔹 POST /api/auth/login
router.post("/login", login);

// 🔹 GET /api/auth/verify
router.get("/verify", verifyToken);

// 🔹 POST /api/auth/register (admin only, opsional)
router.post("/register", register);

export default router;