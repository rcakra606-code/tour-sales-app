const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

// Semua dashboard harus login
router.use(authMiddleware);

router.get("/", dashboardController.getDashboardData);

module.exports = router;
