const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Endpoint registrasi
router.post("/register", authController.register);

// Endpoint login
router.post("/login", authController.login);

// Endpoint verifikasi token
router.get("/verify", authController.verifyToken);

module.exports = router;
