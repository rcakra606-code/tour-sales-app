/**
 * ==========================================================
 * 📁 routes/tours.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Endpoint untuk modul Tour:
 * - Ambil semua data tour
 * - Tambah data tour baru
 * - Update data tour
 * - Hapus data tour
 * ==========================================================
 */

import express from "express";
import {
  getTours,
  createTour,
  updateTour,
  deleteTour
} from "../controllers/tourController.js";

const router = express.Router();

// 📋 Ambil seluruh data tour
router.get("/", getTours);

// 💾 Tambah data tour baru
router.post("/", createTour);

// ✏️ Update data tour berdasarkan ID
router.put("/:id", updateTour);

// ❌ Hapus data tour berdasarkan ID
router.delete("/:id", deleteTour);

export default router;