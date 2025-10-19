/**
 * ==========================================================
 * 📁 routes/sales.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Endpoint untuk modul Sales:
 * - Ambil semua data sales
 * - Tambah data sales baru
 * - Hapus data sales berdasarkan ID
 * ==========================================================
 */

import express from "express";
import {
  getSales,
  createSale,
  deleteSale
} from "../controllers/salesController.js";

const router = express.Router();

// 📋 Ambil seluruh data sales
router.get("/", getSales);

// 💾 Tambah data sales baru
router.post("/", createSale);

// ❌ Hapus data sales berdasarkan ID
router.delete("/:id", deleteSale);

export default router;