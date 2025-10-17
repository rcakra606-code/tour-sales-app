const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");

router.get("/", tourController.getTours);
router.post("/", tourController.createTour);
router.delete("/:id", tourController.deleteTour);
router.get("/summary", tourController.getTourSummary);

module.exports = router;
