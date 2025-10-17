// routes/users.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// semua routes butuh login
router.use(authMiddleware);

// GET /api/users -> list pengguna (untuk dropdowns/dll)
router.get("/", usersController.getAll);

// GET /api/users/me -> data user yang login
router.get("/me", usersController.getMe);

// POST /api/users/change-password -> user sendiri ganti password
router.post("/change-password", usersController.changePassword);

// Admin-only routes
router.post("/", roleCheck(["admin"]), usersController.create);
router.put("/:id", roleCheck(["admin"]), usersController.update);
router.delete("/:id", roleCheck(["admin"]), usersController.delete);

// Admin reset password by username
router.post("/reset-password/:username", roleCheck(["admin"]), usersController.resetPassword);

module.exports = router;
