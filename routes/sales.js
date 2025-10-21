// routes/sales.js
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getSales, createSale, deleteSale } from "../controllers/salesController.js";

const router = express.Router();

// Semua route sales butuh autentikasi
router.get("/", authenticate, getSales);
router.post("/", authenticate, createSale);
router.delete("/:id", authenticate, deleteSale);

export default router;