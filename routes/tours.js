// routes/tours.js
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getTours, createTour, deleteTour } from "../controllers/tourController.js";

const router = express.Router();

router.get("/", authenticate, getTours);
router.post("/", authenticate, createTour);
router.delete("/:id", authenticate, deleteTour);

export default router;