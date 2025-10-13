const db = require("../config/database");

exports.getSales = (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT s.*, t.title AS tour_title
      FROM sales s
      LEFT JOIN tours t ON s.tour_id = t.id
      ORDER BY s.date DESC
    `).all();
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching sales:", err);
    res.status(500).json({ message: "Gagal mengambil data sales." });
  }
};

exports.addSale = (req, res) => {
  try {
    const { tour_id, amount, created_by } = req.body;
    if (!tour_id || !amount)
      return res.status(400).json({ message: "Data tidak lengkap." });

    const result = db
      .prepare("INSERT INTO sales (tour_id, amount, created_by) VALUES (?, ?, ?)")
      .run(tour_id, amount, created_by || "system");

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error("❌ Error adding sale:", err);
    res.status(500).json({ message: "Gagal menambah data sales." });
  }
};

exports.deleteSale = (req, res) => {
  try {
    const id = req.params.id;
    db.prepare("DELETE FROM sales WHERE id = ?").run(id);
    res.json({ success: true, message: "Data sales dihapus." });
  } catch (err) {
    console.error("❌ Error deleting sale:", err);
    res.status(500).json({ message: "Gagal menghapus data sales." });
  }
};
