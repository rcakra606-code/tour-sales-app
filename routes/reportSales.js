/**
 * ==========================================================
 * routes/reportSales.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ CRUD data sales
 * ✅ Filter staff (?staff=nama)
 * ✅ Summary per staff
 * ✅ Export Excel
 * ✅ Middleware auth & role
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const reportSalesController = require("../controllers/reportSalesController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// ============================================================
// 📘 GET /api/sales
// Ambil semua data sales (+ optional filter staff_name)
// ============================================================
router.get("/", verifyToken, reportSalesController.getAllSales);

// ============================================================
// 📘 GET /api/sales/:id
// Ambil 1 data sales berdasarkan ID
// ============================================================
router.get("/:id", verifyToken, reportSalesController.getSaleById);

// ============================================================
// 🟢 POST /api/sales
// Tambah data sales baru
// ============================================================
router.post("/", verifyToken, roleCheck(["super", "semi"]), reportSalesController.createSale);

// ============================================================
// 🟡 PUT /api/sales/:id
// Update data sales
// ============================================================
router.put("/:id", verifyToken, roleCheck(["super", "semi"]), reportSalesController.updateSale);

// ============================================================
// 🔴 DELETE /api/sales/:id
// Hapus data sales
// ============================================================
router.delete("/:id", verifyToken, roleCheck(["super"]), reportSalesController.deleteSale);

// ============================================================
// 📊 GET /api/sales/summary/by-staff
// Ringkasan total transaksi, sales & profit per staff
// ============================================================
router.get("/summary/by-staff", verifyToken, roleCheck(["super", "semi"]), reportSalesController.getSalesSummaryByStaff);

// ============================================================
// 📤 GET /api/sales/export
// Export data sales ke Excel
// ============================================================
router.get("/export", verifyToken, roleCheck(["super", "semi", "basic"]), reportSalesController.exportSalesReport);

module.exports = router;
