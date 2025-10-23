import express from "express";
import { getTours, createTour, deleteTour } from "../controllers/tourController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", authenticate, getTours);
router.post("/", authenticate, createTour);
router.delete("/:id", authenticate, deleteTour);
export default router;