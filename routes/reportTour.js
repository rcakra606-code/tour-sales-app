import express from "express";
import { getAllTours, addTour, deleteTour } from "../controllers/reportTourController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getAllTours);
router.post("/", authenticate, addTour);
router.delete("/:id", authenticate, deleteTour);

export default router;