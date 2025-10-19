/**
 * ==========================================================
 * routes/sales.js — Travel Dashboard Enterprise v3.9.3
 * ==========================================================
 * ✅ CRUD data sales
 * ✅ Filter per staff (?staff=nama)
 * ✅ Summary penjualan per staff
 * ✅ Export Excel
 * ✅ Middleware auth & role
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const salesController = require("../controllers/reportSalesController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// ============================================================
// 📘 GET /api/sales
// Ambil semua data sales (+ optional filter staff)
// ============================================================
router.get("/", verifyToken, salesController.getAllSales);

// ============================================================
// 📘 GET /api/sales/:id
// Ambil 1 data sales berdasarkan ID
// ============================================================
router.get("/:id", verifyToken, salesController.getSaleById);

// ============================================================
// 🟢 POST /api/sales
// Tambah data sales baru
// ============================================================
router.post("/", verifyToken, roleCheck(["super", "semi"]), salesController.createSale);

// ============================================================
// 🟡 PUT /api/sales/:id
// Update data sales
// ============================================================
router.put("/:id", verifyToken, roleCheck(["super", "semi"]), salesController.updateSale);

// ============================================================
// 🔴 DELETE /api/sales/:id
// Hapus data sales
// ============================================================
router.delete("/:id", verifyToken, roleCheck(["super"]), salesController.deleteSale);

// ============================================================
// 📊 GET /api/sales/summary/by-staff
// Ringkasan total transaksi, sales & profit per staff
// ============================================================
router.get("/summary/by-staff", verifyToken, roleCheck(["super", "semi"]), salesController.getSalesSummaryByStaff);

// ============================================================
// 📤 GET /api/sales/export
// Export data sales ke Excel
// ============================================================
router.get("/export", verifyToken, roleCheck(["super", "semi", "basic"]), salesController.exportSalesReport);

module.exports = router;
