// routes/users.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// middleware admin-only
function adminOnly(req, res, next) {
  if (req.user?.type !== "super") return res.status(403).json({ error: "Hanya admin yang dapat mengakses." });
  next();
}

router.get("/", adminOnly, userController.getAllUsers);
router.post("/", adminOnly, userController.createUser);
router.put("/", adminOnly, userController.updateUser);
router.delete("/:username", adminOnly, userController.deleteUser);

module.exports = router;
