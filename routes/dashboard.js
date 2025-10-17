// routes/dashboard.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboardController");

router.get("/executive", controller.getExecutiveSummary);

module.exports = router;
