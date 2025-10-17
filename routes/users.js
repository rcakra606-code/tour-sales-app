// routes/users.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

router.use(authMiddleware);

// === CRUD dasar ===
router.get("/", roleCheck(["super", "semi"]), userController.getAll);
router.get("/:id", roleCheck(["super", "semi"]), userController.getById);
router.post("/", roleCheck(["super"]), userController.create);
router.put("/:id", roleCheck(["super"]), userController.update);
router.delete("/:id", roleCheck(["super"]), userController.remove);

// === Password Management ===
router.post("/change-password", userController.changePassword); // user ganti sendiri
router.post("/:id/reset-password", roleCheck(["super"]), userController.resetPassword); // admin reset user

module.exports = router;
