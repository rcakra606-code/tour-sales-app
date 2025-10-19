/**
 * ==========================================================
 * 📁 routes/regions.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Endpoint untuk modul Region Management:
 * - Ambil semua region
 * ==========================================================
 */

import express from "express";
import { getRegions } from "../controllers/regionController.js";

const router = express.Router();

// 🌍 Ambil daftar semua region
router.get("/", getRegions);

export default router;