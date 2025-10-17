// routes/users.js — Final Version
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Middleware untuk admin-only access
function adminOnly(req, res, next) {
  if (!req.user || req.user.type !== "super")
    return res.status(403).json({ error: "Hanya admin yang dapat mengakses." });
  next();
}

// CRUD routes
router.get("/", adminOnly, userController.getAllUsers);
router.post("/", adminOnly, userController.createUser);
router.put("/", adminOnly, userController.updateUser);
router.delete("/:username", adminOnly, userController.deleteUser);

// Self password change (user)
router.post("/change-password", userController.changePassword);

module.exports = router;
