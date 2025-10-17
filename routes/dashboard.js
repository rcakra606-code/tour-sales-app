// routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/summary", dashboardController.summary);
router.get("/detailed", dashboardController.detailed);

module.exports = router;
