// routes/tours.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/tourController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, controller.getAllTours);
router.get("/:id", verifyToken, controller.getTourById);
router.post("/", verifyToken, controller.createTour);
router.put("/:id", verifyToken, controller.updateTour);
router.delete("/:id", verifyToken, controller.deleteTour);

module.exports = router;
