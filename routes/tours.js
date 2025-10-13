const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const authMiddleware = require("../middleware/authMiddleware");

// Proteksi semua endpoint
router.use(authMiddleware);

router.get("/", tourController.getAllTours);
router.post("/", tourController.createTour);
router.put("/:id", tourController.updateTour);
router.delete("/:id", tourController.deleteTour);

module.exports = router;
