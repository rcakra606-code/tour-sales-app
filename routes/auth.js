/**
 * ==========================================================
 * routes/auth.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Login user
 * ✅ Logout user
 * ✅ Token verification
 * ✅ Refresh token (opsional)
 * ✅ Middleware JWT
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

// ============================================================
// 🔑 POST /api/auth/login
// Login user & generate JWT token
// ============================================================
router.post("/login", authController.loginUser);

// ============================================================
// 🧾 GET /api/auth/verify
// Verifikasi token user yang aktif
// ============================================================
router.get("/verify", verifyToken, authController.verifyUser);

// ============================================================
// 🔁 POST /api/auth/refresh
// Generate refresh token baru (opsional)
// ============================================================
router.post("/refresh", authController.refreshToken);

// ============================================================
// 🚪 POST /api/auth/logout
// Logout user (hapus token di client side)
// ============================================================
router.post("/logout", authController.logoutUser);

module.exports = router;
