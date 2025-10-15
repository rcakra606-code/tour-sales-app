const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const roleCheck = require("../middleware/roleCheck");

router.get("/", roleCheck("super"), userController.getAllUsers);
router.post("/", roleCheck("super"), userController.createUser);

module.exports = router;
