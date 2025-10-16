// routes/users.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua route ini butuh login
router.use(authMiddleware);

// === Admin & Super ===
router.get("/", roleCheck(["super", "semi"]), usersController.getAllUsers);
router.post("/", roleCheck(["super", "semi"]), usersController.createUser);
router.put("/reset/:id", roleCheck(["super", "semi"]), usersController.resetPassword);
router.delete("/:id", roleCheck(["super"]), usersController.deleteUser);

// === User Biasa ===
router.put("/change-password", usersController.changePassword);

module.exports = router;
