/**
 * ==========================================================
 * routes/reportSales.js — Travel Dashboard Enterprise v3.7.2
 * ==========================================================
 * ✅ CRUD data sales
 * ✅ Filter berdasarkan nama staff (?staff=nama)
 * ✅ Summary penjualan per staff (untuk dashboard executive)
 * ✅ Sudah terintegrasi middleware auth
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const reportSalesController = require("../controllers/reportSalesController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// ============================================================
// 📘 ROUTES CRUD SALES
// ============================================================

// 🔹 Ambil semua data sales (+ filter staff optional)
router.get("/", verifyToken, reportSalesController.getAllSales);

// 🔹 Ambil 1 data sales by ID
router.get("/:id", verifyToken, reportSalesController.getSaleById);

// 🔹 Tambah data sales
// Hanya admin/supervisor yang boleh menambah data
router.post("/", verifyToken, roleCheck(["super", "semi"]), reportSalesController.createSale);

// 🔹 Update data sales
router.put("/:id", verifyToken, roleCheck(["super", "semi"]), reportSalesController.updateSale);

// 🔹 Hapus data sales
router.delete("/:id", verifyToken, roleCheck(["super", "semi"]), reportSalesController.deleteSale);

// ============================================================
// 📊 ROUTE SUMMARY PENJUALAN PER STAFF
// ============================================================
// Endpoint ini digunakan untuk dashboard executive
// untuk menampilkan total transaksi, sales, dan profit tiap staff.
router.get("/summary/by-staff", verifyToken, reportSalesController.getSalesSummaryByStaff);

module.exports = router;
