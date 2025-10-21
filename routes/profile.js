// routes/profile.js
import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { authenticate } from "../middleware/authMiddleware.js"; // pastikan middleware ini ada dan menetapkan req.user

const router = express.Router();

// Semua route profile butuh autentikasi
router.get("/", authenticate, getProfile);
router.put("/", authenticate, updateProfile);

export default router;