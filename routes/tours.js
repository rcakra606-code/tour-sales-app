// routes/tours.js
const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");

// GET list & summary
router.get("/", tourController.getTours);
router.get("/summary", tourController.getTourSummary);

// POST new tour
router.post("/", tourController.createTour);

// DELETE
router.delete("/:id", tourController.deleteTour);

// EXPORT routes
router.get("/export/excel", tourController.exportToursExcel);
router.get("/export/csv", tourController.exportToursCSV);

module.exports = router;
