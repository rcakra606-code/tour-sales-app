// src/controllers/salesController.js
const db = require("../config/database");

console.log("✅ SalesController loaded, using database from:", require.resolve("../config/database"));

// =====================================
// GET ALL SALES
// =====================================
exports.getAllSales = (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM sales ORDER BY id DESC");
    const sales = stmt.all();
    res.json({ success: true, data: sales });
  } catch (err) {
    console.error("❌ Failed to fetch sales:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data sales." });
  }
};

// =====================================
// CREATE NEW SALE
// =====================================
exports.createSale = (req, res) => {
  try {
    const { name, email, target, achieved } = req.body;

    if (!name || !email || target == null || achieved == null) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi." });
    }

    const stmt = db.prepare(
      "INSERT INTO sales (name, email, target, achieved) VALUES (?, ?, ?, ?)"
    );
    stmt.run(name, email, target, achieved);

    res.json({ success: true, message: "Sales berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Failed to create sale:", err);
    res.status(500).json({ success: false, message: "Gagal menambahkan data sales." });
  }
};

// =====================================
// UPDATE SALE (optional)
// =====================================
exports.updateSale = (req, res) => {
  try {
    const { id, name, email, target, achieved } = req.body;
    if (!id || !name || !email || target == null || achieved == null) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi." });
    }

    const stmt = db.prepare(
      "UPDATE sales SET name=?, email=?, target=?, achieved=? WHERE id=?"
    );
    const info = stmt.run(name, email, target, achieved, id);

    if (info.changes === 0) {
      return res.status(404).json({ success: false, message: "Data sales tidak ditemukan." });
    }

    res.json({ success: true, message: "Sales berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Failed to update sale:", err);
    res.status(500).json({ success: false, message: "Gagal memperbarui data sales." });
  }
};

// =====================================
// DELETE SALE
// =====================================
exports.deleteSale = (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "ID wajib disertakan." });

    const stmt = db.prepare("DELETE FROM sales WHERE id=?");
    const info = stmt.run(id);

    if (info.changes === 0) {
      return res.status(404).json({ success: false, message: "Data sales tidak ditemukan." });
    }

    res.json({ success: true, message: "Sales berhasil dihapus." });
  } catch (err) {
    console.error("❌ Failed to delete sale:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus data sales." });
  }
};
