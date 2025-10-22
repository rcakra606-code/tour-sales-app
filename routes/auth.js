// ==========================================================
// 🔐 Auth Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { login, verifyToken, register } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.get("/verify", verifyToken);
router.post("/register", register); // opsional (admin only)

export default router;