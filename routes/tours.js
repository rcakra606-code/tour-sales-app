const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const auth = require("../middleware/authMiddleware");
router.post("/", auth, tourController.create);
router.get("/", auth, tourController.list);
module.exports = router;
