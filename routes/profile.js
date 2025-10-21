// ==========================================================
// 👤 Profile Routes — Travel Dashboard Enterprise v5.4.0
// ==========================================================
// Endpoint:
//   GET /api/profile   → Ambil data profil user aktif
//   PUT /api/profile   → Update profil user aktif
// ==========================================================

import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
} from "../controllers/profileController.js";

const router = express.Router();

// ==========================================================
// 🧭 ROUTES
// ==========================================================

// 🔹 GET profil user aktif
router.get("/", authenticate, async (req, res) => {
  await getProfile(req, res);
});

// 🔹 UPDATE profil user aktif
router.put("/", authenticate, async (req, res) => {
  await updateProfile(req, res);
});

// ==========================================================
// 🚀 EXPORT ROUTER
// ==========================================================
export default router;