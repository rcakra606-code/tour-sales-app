const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const authMiddleware = require("../middleware/authMiddleware");

// Semua route tours memerlukan autentikasi
router.use(authMiddleware);

// CRUD Tours
router.get("/", tourController.getAllTours);
router.post("/", tourController.createTour);
router.get("/:id", tourController.getTourById);
router.put("/:id", tourController.updateTour);
router.delete("/:id", tourController.deleteTour);

module.exports = router;
