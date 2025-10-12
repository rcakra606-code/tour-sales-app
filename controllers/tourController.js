// =====================================
// ✅ Tours Controller
// =====================================
const db = require("../config/database");

// ================================
// ✅ GET ALL TOURS
// ================================
exports.getAllTours = (req, res) => {
  try {
    const tours = db.prepare("SELECT * FROM tours ORDER BY id DESC").all();
    res.json({ success: true, tours });
  } catch (err) {
    console.error("❌ Error loading tours:", err);
    res.status(500).json({ success: false, message: "Gagal memuat data tour." });
  }
};

// ================================
// ✅ ADD NEW TOUR
// ================================
exports.addTour = (req, res) => {
  try {
    const { title, description, price, date } = req.body;

    if (!title || !price || !date) {
      return res.status(400).json({ message: "Data tour tidak lengkap." });
    }

    const stmt = db.prepare(
      "INSERT INTO tours (title, description, price, date) VALUES (?, ?, ?, ?)"
    );
    stmt.run(title, description, price, date);

    res.json({ success: true, message: "Tour berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Error adding tour:", err);
    res.status(500).json({ success: false, message: "Gagal menambahkan tour." });
  }
};

// ================================
// ✅ DELETE TOUR
// ================================
exports.deleteTour = (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare("DELETE FROM tours WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: "Tour tidak ditemukan." });
    }

    res.json({ success: true, message: "Tour berhasil dihapus." });
  } catch (err) {
    console.error("❌ Error deleting tour:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus tour." });
  }
};
