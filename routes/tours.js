// =====================================
// ✅ Tours Routes
// =====================================
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const toursController = require("../controllers/toursController");

router.use(authenticateToken);
router.get("/", toursController.getAllTours);
router.post("/", toursController.createTour);

module.exports = router;
