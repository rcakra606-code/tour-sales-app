// =====================================
// ✅ Sales Controller
// =====================================
const db = require("../config/database");

// Ambil semua data penjualan
exports.getAll = (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT s.id, s.customer_name, s.amount, s.sale_date, s.created_by, 
             t.title AS tour_name
      FROM sales s
      LEFT JOIN tours t ON s.tour_id = t.id
      ORDER BY s.id DESC
    `).all();

    res.json({ success: true, sales: rows });
  } catch (e) {
    console.error("❌ Gagal mengambil data sales:", e);
    res.status(500).json({ success: false, message: "Gagal memuat data penjualan." });
  }
};

// Tambah data penjualan baru
exports.create = (req, res) => {
  try {
    const { tour_id, customer_name, amount, sale_date } = req.body;
    const created_by = req.user.username;

    if (!tour_id || !customer_name || !amount)
      return res.status(400).json({ success: false, message: "Semua kolom wajib diisi." });

    const stmt = db.prepare(`
      INSERT INTO sales (tour_id, customer_name, amount, sale_date, created_by)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(tour_id, customer_name, amount, sale_date || new Date().toISOString(), created_by);

    res.json({ success: true, message: "Penjualan berhasil ditambahkan." });
  } catch (e) {
    console.error("❌ Gagal menambah sales:", e);
    res.status(500).json({ success: false, message: "Gagal menambah penjualan." });
  }
};

// Update data penjualan
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { tour_id, customer_name, amount, sale_date } = req.body;

    const stmt = db.prepare(`
      UPDATE sales SET tour_id = ?, customer_name = ?, amount = ?, sale_date = ?
      WHERE id = ?
    `);
    stmt.run(tour_id, customer_name, amount, sale_date, id);

    res.json({ success: true, message: "Data penjualan berhasil diperbarui." });
  } catch (e) {
    console.error("❌ Gagal update sales:", e);
    res.status(500).json({ success: false, message: "Gagal memperbarui data penjualan." });
  }
};

// Hapus data penjualan
exports.remove = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM sales WHERE id = ?").run(id);
    res.json({ success: true, message: "Penjualan berhasil dihapus." });
  } catch (e) {
    console.error("❌ Gagal hapus sales:", e);
    res.status(500).json({ success: false, message: "Gagal menghapus data penjualan." });
  }
};
