// controllers/salesController.js
const db = require("../config/database");

exports.getAll = (req, res) => {
  db.all(
    `SELECT sales.*, tours.name AS tour_name 
     FROM sales 
     LEFT JOIN tours ON sales.tour_id = tours.id
     ORDER BY sales.id DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Gagal mengambil data penjualan." });
      res.json(rows);
    }
  );
};

exports.create = (req, res) => {
  const { tour_id, customer_name, amount, date } = req.body;
  if (!tour_id || !customer_name || !amount) {
    return res.status(400).json({ message: "Data tidak lengkap." });
  }

  db.run(
    "INSERT INTO sales (tour_id, customer_name, amount, date) VALUES (?, ?, ?, ?)",
    [tour_id, customer_name, amount, date || new Date().toISOString()],
    function (err) {
      if (err) return res.status(500).json({ message: "Gagal menambah data penjualan." });
      res.json({ success: true, id: this.lastID });
    }
  );
};

exports.update = (req, res) => {
  const { id } = req.params;
  const { tour_id, customer_name, amount, date } = req.body;

  db.run(
    "UPDATE sales SET tour_id=?, customer_name=?, amount=?, date=? WHERE id=?",
    [tour_id, customer_name, amount, date, id],
    function (err) {
      if (err) return res.status(500).json({ message: "Gagal memperbarui data." });
      res.json({ success: true, changes: this.changes });
    }
  );
};

exports.remove = (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM sales WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ message: "Gagal menghapus data." });
    res.json({ success: true, deleted: this.changes });
  });
};
