// routes/auth.js
const express = require("express");
const router = express.Router();

// === Import Controller ===
let authController;
try {
  authController = require("../controllers/authController");
  console.log("✅ Auth controller loaded successfully");
} catch (err) {
  console.error("❌ Failed to load authController:", err);
  authController = {
    register: (req, res) => res.status(500).json({ error: "AuthController missing" }),
    login: (req, res) => res.status(500).json({ error: "AuthController missing" }),
  };
}

// === Log route initialization ===
console.log("✅ Auth routes initialized");

// === Routes ===
router.get("/test", (req, res) => {
  res.json({ status: "ok", message: "Auth API connected" });
});

router.post("/register", authController.register);
router.post("/login", authController.login);

// === Export router ===
module.exports = router;
