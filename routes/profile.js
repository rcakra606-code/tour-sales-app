// ==========================================================
// 👤 Profile Routes — v5.4.6
// ==========================================================
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", authenticate, getProfile);
router.put("/", authenticate, updateProfile);

export default router;