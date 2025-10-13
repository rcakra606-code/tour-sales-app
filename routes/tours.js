// routes/tours.js
const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const authMiddleware = require("../middleware/authMiddleware");

// Semua route di bawah ini wajib login
router.use(authMiddleware);

router.get("/", tourController.getAllTours);
router.get("/:id", tourController.getTourById);
router.post("/", tourController.createTour);
router.put("/:id", tourController.updateTour);
router.delete("/:id", tourController.deleteTour);

module.exports = router;
