/**
 * ==========================================================
 * 📁 routes/logs.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Endpoint untuk modul Log Management:
 * - Ambil daftar log aktivitas sistem
 * ==========================================================
 */

import express from "express";
import { getLogs } from "../controllers/logController.js";

const router = express.Router();

// 📜 Ambil semua data log sistem
router.get("/", getLogs);

export default router;