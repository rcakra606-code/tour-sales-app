// =====================================
// ✅ Auth Routes (Final - Render Compatible)
// =====================================
const express = require("express");
const router = express.Router();

// Gunakan path absolut agar tidak error di Render
const path = require("path");
const controllerPath = path.join(__dirname, "../controllers/authController");

// Coba require dengan fallback (antisipasi error path)
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

// =====================================
// ✅ Routes Definition
// =====================================

// Register user baru
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Verifikasi token JWT
router.get("/verify", authController.verifyToken);

// =====================================
// ✅ Export router
// =====================================
module.exports = router;
