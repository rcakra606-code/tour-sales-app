// routes/tours.js
const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const db = require("../config/database");

// 📍 GET semua tours (bisa diakses semua user yang login)
router.get("/", verifyToken, (req, res) => {
  try {
    const tours = db.prepare("SELECT * FROM tours ORDER BY id DESC").all();
    res.json({ success: true, data: tours });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 📍 GET tour by ID
router.get("/:id", verifyToken, (req, res) => {
  try {
    const tour = db.prepare("SELECT * FROM tours WHERE id = ?").get(req.params.id);
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
    res.json({ success: true, data: tour });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 📍 POST tambah tour (admin only)
router.post("/", verifyToken, isAdmin, (req, res) => {
  try {
    const { title, description, price, date, location } = req.body;
    const stmt = db.prepare("INSERT INTO tours (title, description, price, date, location) VALUES (?, ?, ?, ?, ?)");
    const result = stmt.run(title, description, price, date, location);
    res.json({ success: true, message: "Tour added successfully", id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 📍 PUT update tour (admin only)
router.put("/:id", verifyToken, isAdmin, (req, res) => {
  try {
    const { title, description, price, date, location } = req.body;
    const stmt = db.prepare(`
      UPDATE tours SET title = ?, description = ?, price = ?, date = ?, location = ? WHERE id = ?
    `);
    const result = stmt.run(title, description, price, date, location, req.params.id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: "Tour not found" });
    res.json({ success: true, message: "Tour updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 📍 DELETE tour (admin only)
router.delete("/:id", verifyToken, isAdmin, (req, res) => {
  try {
    const stmt = db.prepare("DELETE FROM tours WHERE id = ?");
    const result = stmt.run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: "Tour not found" });
    res.json({ success: true, message: "Tour deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
