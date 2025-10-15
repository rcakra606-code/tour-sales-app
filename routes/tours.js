const express = require("express");
const router = express.Router();
const toursController = require("../controllers/toursController");
const roleCheck = require("../middleware/roleCheck");

// Semua role login bisa lihat data tour
router.get("/", roleCheck("super", "semi", "basic"), toursController.getAllTours);

// Hanya super dan semi bisa tambah/edit
router.post("/", roleCheck("super", "semi"), toursController.createTour);
router.put("/:id", roleCheck("super", "semi"), toursController.updateTour);
router.delete("/:id", roleCheck("super"), toursController.deleteTour);

module.exports = router;
