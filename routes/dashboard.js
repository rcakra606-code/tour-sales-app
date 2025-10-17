// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// GET /api/dashboard/summary
router.get("/summary", dashboardController.summary);

module.exports = router;
