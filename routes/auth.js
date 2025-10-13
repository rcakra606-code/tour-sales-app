// routes/auth.js
const express = require("express");
const router = express.Router();
const path = require("path");

// Gunakan path absolut agar tidak error di Render
const controllerPath = path.join(__dirname, "../controllers/authController");

let authController;
try {
  authController = require(controllerPath);
  console.log("✅ Auth route terhubung ke controller:", controllerPath);
} catch (err) {
  console.error("❌ Gagal load authController:", err.message);
  router.get("*", (_, res) => res.status(500).json({ error: "Auth controller not found." }));
  module.exports = router;
  return;
}

// ===== Routes =====
router.post("/login", authController.login);
router.post("/register", authController.register);

module.exports = router;
