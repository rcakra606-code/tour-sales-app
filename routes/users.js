/**
 * ==========================================================
 * routes/users.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ CRUD user
 * ✅ Role-based access control
 * ✅ Middleware auth
 * ✅ Integrasi user management frontend
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// ============================================================
// 📘 GET /api/users
// Ambil semua user (hanya super & semi)
// ============================================================
router.get("/", verifyToken, roleCheck(["super", "semi"]), userController.getAllUsers);

// ============================================================
// 📘 GET /api/users/:id
// Ambil 1 user berdasarkan ID
// ============================================================
router.get("/:id", verifyToken, roleCheck(["super", "semi"]), userController.getUserById);

// ============================================================
// 🟢 POST /api/users
// Tambah user baru (khusus super admin)
// ============================================================
router.post("/", verifyToken, roleCheck(["super"]), userController.createUser);

// ============================================================
// 🟡 PUT /api/users/:id
// Update data user (nama, email, role, password)
// ============================================================
router.put("/:id", verifyToken, roleCheck(["super", "semi"]), userController.updateUser);

// ============================================================
// 🔴 DELETE /api/users/:id
// Hapus user (khusus super admin)
// ============================================================
router.delete("/:id", verifyToken, roleCheck(["super"]), userController.deleteUser);

// ============================================================
// 🔄 PATCH /api/users/:id/role
// Ubah role user (super, semi, basic)
// ============================================================
router.patch("/:id/role", verifyToken, roleCheck(["super"]), userController.changeUserRole);

module.exports = router;
