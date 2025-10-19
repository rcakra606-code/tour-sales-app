/**
 * ==========================================================
 * routes/tours.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ CRUD data Tour
 * ✅ Export Excel
 * ✅ Middleware auth & role
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// ============================================================
// 📘 GET /api/tours
// Ambil semua data tour
// ============================================================
router.get("/", verifyToken, tourController.getAllTours);

// ============================================================
// 📘 GET /api/tours/:id
// Ambil 1 data tour berdasarkan ID
// ============================================================
router.get("/:id", verifyToken, tourController.getTourById);

// ============================================================
// 🟢 POST /api/tours
// Tambah data tour baru
// ============================================================
router.post("/", verifyToken, roleCheck(["super", "semi"]), tourController.createTour);

// ============================================================
// 🟡 PUT /api/tours/:id
// Update data tour
// ============================================================
router.put("/:id", verifyToken, roleCheck(["super", "semi"]), tourController.updateTour);

// ============================================================
// 🔴 DELETE /api/tours/:id
// Hapus data tour
// ============================================================
router.delete("/:id", verifyToken, roleCheck(["super"]), tourController.deleteTour);

// ============================================================
// 📤 GET /api/tours/export
// Export data tour ke Excel
// ============================================================
router.get("/export", verifyToken, roleCheck(["super", "semi", "basic"]), tourController.exportTourReport);

module.exports = router;
