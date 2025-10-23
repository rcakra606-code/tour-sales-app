import express from "express";
import { login, verifyToken, refreshToken, register } from "../controllers/authController.js";

const router = express.Router();

// === LOGIN ===
router.post("/login", login);

// === VERIFY TOKEN ===
router.get("/verify", verifyToken);

// === REFRESH TOKEN ===
router.post("/refresh", refreshToken);

// === REGISTER (opsional, hanya admin) ===
router.post("/register", register);

export default router;