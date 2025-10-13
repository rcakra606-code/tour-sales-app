// routes/tours.js
const express = require("express");
const router = express.Router();
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

const controllerPath = path.join(__dirname, "../controllers/tourController");

let tourController;
try {
  tourController = require(controllerPath);
  console.log("✅ Tour route terhubung ke controller:", controllerPath);
} catch (err) {
  console.error("❌ Tour controller not found:", err.message);
  router.get("*", (_, res) => res.status(500).json({ error: "Tour controller not found." }));
  module.exports = router;
  return;
}

// ===== Routes =====
router.get("/", authMiddleware, tourController.getAllTours);
router.get("/:id", authMiddleware, tourController.getTourById);
router.post("/", authMiddleware, tourController.createTour);
router.put("/:id", authMiddleware, tourController.updateTour);
router.delete("/:id", authMiddleware, tourController.deleteTour);

module.exports = router;
