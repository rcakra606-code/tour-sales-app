const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, tourController.getAllTours);
router.get("/:id", authMiddleware, tourController.getTourById);
router.post("/", authMiddleware, tourController.createTour);
router.put("/:id", authMiddleware, tourController.updateTour);
router.delete("/:id", authMiddleware, tourController.deleteTour);

module.exports = router;
