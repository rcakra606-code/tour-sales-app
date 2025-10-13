const db = require("../config/database");

exports.getAllTours = (req, res) => {
  try {
    const tours = db.prepare("SELECT * FROM tours ORDER BY id DESC").all();
    res.json(tours);
  } catch (err) {
    console.error("❌ Error fetching tours:", err);
    res.status(500).json({ message: "Gagal mengambil data tours." });
  }
};

exports.createTour = (req, res) => {
  try {
    const { title, location, price, description, image } = req.body;
    if (!title || !location || !price)
      return res.status(400).json({ message: "Data tidak lengkap." });

    const result = db
      .prepare("INSERT INTO tours (title, location, price, description, image) VALUES (?, ?, ?, ?, ?)")
      .run(title, location, price, description || "", image || null);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error("❌ Error adding tour:", err);
    res.status(500).json({ message: "Gagal menambah tour." });
  }
};

exports.updateTour = (req, res) => {
  try {
    const id = req.params.id;
    const { title, location, price, description, image } = req.body;

    db.prepare(
      "UPDATE tours SET title=?, location=?, price=?, description=?, image=? WHERE id=?"
    ).run(title, location, price, description, image, id);

    res.json({ success: true, message: "Tour berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Error updating tour:", err);
    res.status(500).json({ message: "Gagal memperbarui tour." });
  }
};

exports.deleteTour = (req, res) => {
  try {
    const id = req.params.id;
    db.prepare("DELETE FROM tours WHERE id=?").run(id);
    res.json({ success: true, message: "Tour berhasil dihapus." });
  } catch (err) {
    console.error("❌ Error deleting tour:", err);
    res.status(500).json({ message: "Gagal menghapus tour." });
  }
};
