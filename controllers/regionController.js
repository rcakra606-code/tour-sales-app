/**
 * 🌍 Region Controller
 */
const db = require("../config/database");

exports.getAll = (req, res) => {
  try {
    const regions = db.prepare("SELECT * FROM regions ORDER BY id DESC").all();
    res.json(regions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nama region wajib diisi" });

    const exists = db.prepare("SELECT * FROM regions WHERE name = ?").get(name);
    if (exists) return res.status(400).json({ message: "Nama region sudah ada" });

    db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)").run(name, description || null);
    res.json({ message: "Region berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const region = db.prepare("SELECT * FROM regions WHERE id = ?").get(id);
    if (!region) return res.status(404).json({ message: "Region tidak ditemukan" });

    db.prepare("UPDATE regions SET name = ?, description = ? WHERE id = ?").run(name, description, id);
    res.json({ message: "Region berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    const { id } = req.params;
    const region = db.prepare("SELECT * FROM regions WHERE id = ?").get(id);
    if (!region) return res.status(404).json({ message: "Region tidak ditemukan" });

    db.prepare("DELETE FROM regions WHERE id = ?").run(id);
    res.json({ message: "Region berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
