// routes/users.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua route user harus login
router.use(authMiddleware);

// === Ambil semua user (khusus super) ===
router.get("/", roleCheck("super"), usersController.getAllUsers);

// === Tambah user baru (khusus super) ===
router.post("/", roleCheck("super"), usersController.addUser);

// === Ambil 1 user berdasarkan ID (super & semi) ===
router.get("/:id", roleCheck("super", "semi"), usersController.getUserById);

// === Update user (super atau user sendiri) ===
router.put("/:id", roleCheck("super", "semi"), usersController.updateUser);

// === Hapus user (hanya super) ===
router.delete("/:id", roleCheck("super"), usersController.deleteUser);

module.exports = router;
