// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.get("/verify", authController.verify);
router.post("/logout", authController.logout);

module.exports = router;
