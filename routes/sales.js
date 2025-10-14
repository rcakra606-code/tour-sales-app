const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

// === GET ALL SALES ===
router.get("/", authenticateToken, (req, res) => {
  db.all("SELECT * FROM sales ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: rows });
  });
});

// === ADD SALE (ADMIN ONLY) ===
router.post("/", authenticateToken, isAdmin, (req, res) => {
  const { tour_id, customer_name, amount } = req.body;
  if (!tour_id || !customer_name || !amount)
    return res.status(400).json({ success: false, message: "Semua kolom wajib diisi" });

  db.run(
    "INSERT INTO sales (tour_id, customer_name, amount, date) VALUES (?, ?, ?, datetime('now'))",
    [tour_id, customer_name, amount],
    function (err) {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: "Data sales berhasil ditambahkan", id: this.lastID });
    }
  );
});

// === DELETE SALE (ADMIN ONLY) ===
router.delete("/:id", authenticateToken, isAdmin, (req, res) => {
  db.run("DELETE FROM sales WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Data sales berhasil dihapus" });
  });
});

module.exports = router;
