// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");

// Semua route dashboard harus login
router.use(authMiddleware);

router.get("/", dashboardController.getStats);
router.get("/summary", dashboardController.getSummary);

module.exports = router;
