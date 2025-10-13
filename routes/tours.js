const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Tour = require("../models/tourModel");

// GET /api/tours → semua tour
router.get("/", authMiddleware, (req, res) => {
  try {
    const tours = Tour.getAll();
    res.json({ success: true, tours });
  } catch (err) {
    console.error("❌ GET /tours error:", err);
    res.status(500).json({ success: false, message: "Kesalahan server" });
  }
});

// POST /api/tours → tambah tour (admin/staff)
router.post("/", authMiddleware, (req, res) => {
  try {
    const { title, description, price, date } = req.body;
    if (!title || !description || !price || !date)
      return res.status(400).json({ success: false, message: "Semua field wajib diisi." });

    const tour = Tour.create({ title, description, price, date });
    res.json({ success: true, tour });
  } catch (err) {
    console.error("❌ POST /tours error:", err);
    res.status(500).json({ success: false, message: "Kesalahan server" });
  }
});

// PUT /api/tours/:id → edit tour
router.put("/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, date } = req.body;
    const updated = Tour.update(id, { title, description, price, date });
    res.json({ success: true, updated });
  } catch (err) {
    console.error("❌ PUT /tours error:", err);
    res.status(500).json({ success: false, message: "Kesalahan server" });
  }
});

// DELETE /api/tours/:id → hapus tour
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = Tour.delete(id);
    res.json({ success: true, deleted });
  } catch (err) {
    console.error("❌ DELETE /tours error:", err);
    res.status(500).json({ success: false, message: "Kesalahan server" });
  }
});

module.exports = router;
