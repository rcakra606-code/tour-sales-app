// routes/tours.js
const express = require("express");
const router = express.Router();
const toursController = require("../controllers/tourController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", toursController.getAllTours);
router.post("/", toursController.createTour);

module.exports = router;
