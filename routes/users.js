const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");
router.get("/", auth, userController.list);
router.post("/", auth, roleCheck(["super"]), userController.create);
module.exports = router;
