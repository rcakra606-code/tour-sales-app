// routes/users.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");
const usersController = require("../controllers/userController");

// Semua route butuh login
router.use(authMiddleware);

// Admin only
router.get("/", roleCheck("admin"), usersController.getAllUsers);
router.put("/reset/:id", roleCheck("admin"), usersController.resetPassword);

// User biasa bisa ubah password sendiri
router.put("/change-password", usersController.changePassword);

module.exports = router;
