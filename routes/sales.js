// ==========================================================
// 💰 Sales Management Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
} from "../controllers/salesController.js";

const router = express.Router();

// GET semua sales (bisa difilter)
router.get("/", authenticate, getSales);

// GET by ID
router.get("/:id", authenticate, getSaleById);

// POST - Tambah data sales
router.post("/", authenticate, createSale);

// PUT - Update data sales
router.put("/:id", authenticate, updateSale);

// DELETE - Hapus data sales
router.delete("/:id", authenticate, deleteSale);

export default router;