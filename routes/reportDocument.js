// routes/reportDocument.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/reportDocumentController");

router.get("/", controller.getReports);
router.post("/", controller.createReport);
router.put("/:id", controller.updateReport);
router.delete("/:id", controller.deleteReport);
router.get("/summary", controller.getSummary);
router.get("/export/excel", controller.exportExcel);

module.exports = router;
