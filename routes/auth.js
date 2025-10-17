// routes/auth.js — Travel Dashboard Enterprise v2.0
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// === AUTH ROUTES ===
router.post("/login", authController.login);
router.post("/register", authController.register); // optional if admin wants to add via API
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/verify", authController.verify);

module.exports = router;
