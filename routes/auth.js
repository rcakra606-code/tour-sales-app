// ==========================================================
// 🧭 Auth Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { login, refreshToken, verify } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/verify", verify);

export default router;