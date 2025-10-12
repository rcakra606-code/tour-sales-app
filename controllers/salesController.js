// =====================================
// ✅ Sales Controller
// =====================================
const db = require("../config/database");

// ================================
// ✅ GET ALL SALES
// ================================
exports.getAllSales = (req, res) => {
  try {
    const sales = db
      .prepare(
        `SELECT s.*, t.title AS tour_title 
         FROM sales s 
         LEFT JOIN tours t ON s.tour_id = t.id 
         ORDER BY s.id DESC`
      )
      .all();

    res.json({ success: true, sales });
  } catch (err) {
    console.error("❌ Error loading sales:", err);
    res.status(500).json({ success: false, message: "Gagal memuat data penjualan." });
  }
};

// ================================
// ✅ ADD NEW SALE
// ================================
exports.addSale = (req, res) => {
  try {
    const { tour_id, customer_name, amount, sale_date, created_by } = req.body;

    if (!tour_id || !customer_name || !amount) {
      return res.status(400).json({ message: "Data penjualan tidak lengkap." });
    }

    db.prepare(
      "INSERT INTO sales (tour_id, customer_name, amount, sale_date, created_by) VALUES (?, ?, ?, ?, ?)"
    ).run(tour_id, customer_name, amount, sale_date || new Date().toISOString(), created_by || "admin");

    res.json({ success: true, message: "Penjualan berhasil disimpan." });
  } catch (err) {
    console.error("❌ Error adding sale:", err);
    res.status(500).json({ success: false, message: "Gagal menambahkan data penjualan." });
  }
};

// ================================
// ✅ DELETE SALE
// ================================
exports.deleteSale = (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare("DELETE FROM sales WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: "Penjualan tidak ditemukan." });
    }

    res.json({ success: true, message: "Penjualan berhasil dihapus." });
  } catch (err) {
    console.error("❌ Error deleting sale:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus penjualan." });
  }
};
