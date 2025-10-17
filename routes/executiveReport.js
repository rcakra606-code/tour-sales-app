// routes/executiveReport.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/executiveReportController");

router.get("/export/excel", controller.exportExecutiveReport);

module.exports = router;
