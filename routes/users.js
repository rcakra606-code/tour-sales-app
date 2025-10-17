const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

function adminOnly(req, res, next) {
  if (!req.user || req.user.type !== "super")
    return res.status(403).json({ error: "Hanya admin yang dapat mengakses." });
  next();
}

router.get("/", adminOnly, userController.getAllUsers);
router.post("/", adminOnly, userController.createUser);
router.put("/", adminOnly, userController.updateUser);
router.delete("/:username", adminOnly, userController.deleteUser);

// Route tambahan: user login ganti password sendiri
router.post("/change-password", userController.changePassword);

module.exports = router;
