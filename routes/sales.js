import express from "express";
import { getSales, createSale, deleteSale } from "../controllers/salesController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", authenticate, getSales);
router.post("/", authenticate, createSale);
router.delete("/:id", authenticate, deleteSale);
export default router;