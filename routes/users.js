// routes/users.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const roleCheck = require("../middleware/roleCheck");

// 🔹 Hanya super bisa lihat dan kelola user
router.get("/", roleCheck("super"), usersController.getAllUsers);
router.post("/", roleCheck("super"), usersController.createUser);
router.put("/:id", roleCheck("super"), usersController.updateUser);
router.delete("/:id", roleCheck("super"), usersController.deleteUser);

module.exports = router;
