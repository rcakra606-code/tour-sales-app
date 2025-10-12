const express = require("express");
const router = express.Router();
const controller = require("../controllers/tourController");

router.get("/", controller.getAllTours);
router.post("/", controller.addTour);
router.delete("/:id", controller.deleteTour);

module.exports = router;
