const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");

// === GET ALL TOURS ===
router.get("/", authenticateToken, (req, res) => {
  db.all("SELECT * FROM tours ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: rows });
  });
});

// === ADD TOUR ===
router.post("/", authenticateToken, (req, res) => {
  const { title, description, price, location } = req.body;
  if (!title || !price)
    return res.status(400).json({ success: false, message: "Judul dan harga wajib diisi" });

  db.run(
    "INSERT INTO tours (title, description, price, location, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
    [title, description, price, location],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: "Tour berhasil ditambahkan", id: this.lastID });
    }
  );
});

// === DELETE TOUR ===
router.delete("/:id", authenticateToken, (req, res) => {
  db.run("DELETE FROM tours WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Tour berhasil dihapus" });
  });
});

module.exports = router;
