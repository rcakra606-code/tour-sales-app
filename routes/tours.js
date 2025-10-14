const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { getAllTours, createTour, deleteTour } = require("../controllers/tourController");

router.get("/", verifyToken, getAllTours);
router.post("/", verifyToken, createTour);
router.delete("/:id", verifyToken, deleteTour);

module.exports = router;
