// ==========================================================
// 💹 Report Sales Routes — Travel Dashboard Enterprise v5.4.6
// ==========================================================
import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getAllSalesReport,
  getSalesByStaff,
  getSalesSummary,
  exportSalesReport,
} from "../controllers/reportSalesController.js";

const router = express.Router();

// Semua user login bisa lihat laporan mereka sendiri
router.get("/", authenticate, getAllSalesReport);

// Ambil data berdasarkan staff (untuk staff login)
router.get("/staff/:staff_name", authenticate, getSalesByStaff);

// Ambil summary total sales + profit
router.get("/summary", authenticate, getSalesSummary);

// Export Excel / CSV
router.get("/export", authenticate, exportSalesReport);

export default router;