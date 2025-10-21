// ==========================================================
// 🔐 Auth Routes — Travel Dashboard Enterprise v5.4.0
// ==========================================================
// Endpoint:
//   POST /api/auth/login
//   POST /api/auth/register
//   POST /api/auth/refresh
//   GET  /api/auth/verify
// ==========================================================

import express from "express";
import {
  login,
  register,
  refreshToken,
  verify,
} from "../controllers/authController.js";

const router = express.Router();

// ==========================================================
// 🧭 AUTH ROUTES
// ==========================================================

// 🔹 Login user
router.post("/login", async (req, res) => {
  await login(req, res);
});

// 🔹 Register user baru (Admin / Semiadmin)
router.post("/register", async (req, res) => {
  await register(req, res);
});

// 🔹 Refresh token
router.post("/refresh", async (req, res) => {
  await refreshToken(req, res);
});

// 🔹 Verify access token
router.get("/verify", async (req, res) => {
  await verify(req, res);
});

// ==========================================================
// 🚀 Export default router
// ==========================================================
export default router;