const express = require("express");
const router = express.Router();
const controller = require("../controllers/profileController");

router.get("/", controller.getProfile);
router.put("/", controller.updateProfile);

module.exports = router;
