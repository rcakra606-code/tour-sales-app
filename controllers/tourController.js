// =====================================
// ✅ Tour Controller
// =====================================
const db = require("../config/database");

// Ambil semua tour
exports.getAll = (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM tours ORDER BY id DESC").all();
    res.json({ success: true, tours: rows });
  } catch (e) {
    console.error("❌ Gagal mengambil data tours:", e);
    res.status(500).json({ success: false, message: "Gagal memuat data tour." });
  }
};

// Ambil 1 tour berdasarkan ID
exports.getById = (req, res) => {
  try {
    const tour = db.prepare("SELECT * FROM tours WHERE id = ?").get(req.params.id);
    if (!tour) return res.status(404).json({ success: false, message: "Tour tidak ditemukan." });
    res.json({ success: true, tour });
  } catch (e) {
    console.error("❌ Gagal mengambil tour:", e);
    res.status(500).json({ success: false, message: "Gagal memuat data tour." });
  }
};

// Tambah tour baru
exports.create = (req, res) => {
  try {
    const { title, description, price, date } = req.body;
    if (!title || !price)
      return res.status(400).json({ success: false, message: "Judul dan harga wajib diisi." });

    const stmt = db.prepare(
      "INSERT INTO tours (title, description, price, date) VALUES (?, ?, ?, ?)"
    );
    const result = stmt.run(title, description, price, date);

    res.json({ success: true, message: "Tour berhasil ditambahkan.", id: result.lastInsertRowid });
  } catch (e) {
    console.error("❌ Gagal menambah tour:", e);
    res.status(500).json({ success: false, message: "Gagal menambah tour." });
  }
};

// Update tour
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, date } = req.body;

    const stmt = db.prepare(
      "UPDATE tours SET title = ?, description = ?, price = ?, date = ? WHERE id = ?"
    );
    stmt.run(title, description, price, date, id);

    res.json({ success: true, message: "Tour berhasil diperbarui." });
  } catch (e) {
    console.error("❌ Gagal update tour:", e);
    res.status(500).json({ success: false, message: "Gagal memperbarui tour." });
  }
};

// Hapus tour
exports.remove = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM tours WHERE id = ?").run(id);
    res.json({ success: true, message: "Tour berhasil dihapus." });
  } catch (e) {
    console.error("❌ Gagal hapus tour:", e);
    res.status(500).json({ success: false, message: "Gagal menghapus tour." });
  }
};
