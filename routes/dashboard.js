const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware");
router.get("/summary", auth, dashboardController.summary);
router.get("/charts", auth, dashboardController.charts);
module.exports = router;
