const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// === AUTH ROUTES ===
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/validate", authController.validateToken);

module.exports = router;
