// controllers/salesController.js
const db = require("../config/database");

exports.getAllSales = (req, res) => {
  const sales = db.prepare(`
    SELECT s.*, t.title AS tour_title
    FROM sales s
    LEFT JOIN tours t ON s.tour_id = t.id
  `).all();
  res.json(sales);
};

exports.createSale = (req, res) => {
  const { tour_id, customer_name, total_amount, sale_date } = req.body;

  const result = db
    .prepare("INSERT INTO sales (tour_id, customer_name, total_amount, sale_date) VALUES (?, ?, ?, ?)")
    .run(tour_id, customer_name, total_amount, sale_date);

  res.status(201).json({ message: "Penjualan berhasil ditambahkan", id: result.lastInsertRowid });
};

exports.deleteSale = (req, res) => {
  const result = db.prepare("DELETE FROM sales WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: "Penjualan tidak ditemukan" });
  res.json({ message: "Penjualan berhasil dihapus" });
};
