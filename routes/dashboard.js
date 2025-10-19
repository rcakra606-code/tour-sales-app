/**
 * ==========================================================
 * 📁 routes/dashboard.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Endpoint untuk data ringkasan dashboard:
 * - Total sales
 * - Total profit
 * - Jumlah tours
 * - Target pencapaian
 * ==========================================================
 */

import express from "express";
import { getSummary } from "../controllers/dashboardController.js";

const router = express.Router();

// 📊 Ambil ringkasan data untuk dashboard utama
router.get("/summary", getSummary);

export default router;