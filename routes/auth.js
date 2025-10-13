// routes/auth.js
const express = require("express");
const path = require("path");
const router = express.Router();

const controllerPath = path.join(__dirname, "..", "controllers", "authController");

let authController;
try {
  authController = require(controllerPath);
  console.log("✅ Auth route -> controller loaded:", controllerPath);
} catch (err) {
  console.error("❌ Auth controller not found:", controllerPath, err.message);
  router.get("*", (_, res) => res.status(500).json({ error: "Auth controller not found." }));
  module.exports = router;
  return;
}

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify", authController.verifyToken);

module.exports = router;
