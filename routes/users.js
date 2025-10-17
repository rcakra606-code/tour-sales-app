// routes/users.js — Final Version with Role Middleware
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

/* Middleware untuk per-role access */
function checkRole(roles) {
  return (req, res, next) => {
    const userRole = req.user?.type || "basic";
    if (!roles.includes(userRole))
      return res.status(403).json({ error: "Akses ditolak." });
    next();
  };
}

// === ROUTES ===
router.get("/", checkRole(["semi", "super", "basic"]), userController.getAllUsers);
router.post("/", checkRole(["super"]), userController.createUser);
router.put("/", checkRole(["semi", "super"]), userController.updateUser);
router.delete("/:username", checkRole(["super"]), userController.deleteUser);

// Password Management
router.post("/change-password", userController.changePassword);
router.post("/reset-password", checkRole(["semi", "super"]), userController.resetPassword);

module.exports = router;
