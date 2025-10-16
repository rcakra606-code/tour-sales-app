// controllers/regionController.js
const db = require("../config/database");

exports.getAll = (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM regions ORDER BY name ASC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nama region wajib diisi" });

    const exists = db.prepare("SELECT id FROM regions WHERE name = ?").get(name);
    if (exists) return res.status(409).json({ message: "Region sudah ada" });

    db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)").run(name, description || null);
    res.status(201).json({ message: "Region berhasil dibuat" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nama region wajib diisi" });

    db.prepare("UPDATE regions SET name = ?, description = ? WHERE id = ?").run(name, description || null, id);
    res.json({ message: "Region berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM regions WHERE id = ?").run(id);
    res.json({ message: "Region berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
