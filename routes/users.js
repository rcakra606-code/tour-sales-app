// routes/users.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", usersController.getAllUsers);

module.exports = router;
