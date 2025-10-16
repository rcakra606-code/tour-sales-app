// routes/tours.js
const express = require("express");
const router = express.Router();
const toursController = require("../controllers/tourController");
const authMiddleware = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// Semua endpoint tours butuh autentikasi
router.use(authMiddleware);

// === GET semua tour ===
router.get("/", toursController.getAllTours);

// === POST tambah tour baru (khusus super/semi) ===
router.post("/", roleCheck("super", "semi"), toursController.addTour);

// === GET satu tour ===
router.get("/:id", toursController.getTourById);

// === PUT update tour ===
router.put("/:id", roleCheck("super", "semi"), toursController.updateTour);

// === DELETE tour ===
router.delete("/:id", roleCheck("super"), toursController.deleteTour);

module.exports = router;
