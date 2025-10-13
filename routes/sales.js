// src/routes/sales.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllSales,
  createSale,
  updateSale,
  deleteSale,
} = require("../controllers/salesController");

// Semua route butuh autentikasi
router.use(authMiddleware);

// GET /api/sales → ambil semua sales
router.get("/", getAllSales);

// POST /api/sales → tambah sales baru
router.post("/", createSale);

// PUT /api/sales → update sales
router.put("/", updateSale);

// DELETE /api/sales/:id → hapus sales
router.delete("/:id", deleteSale);

module.exports = router;
