// controllers/regionController.js
const db = require("../config/database");

exports.getAll = (req, res) => {
  try {
    const regions = db.prepare("SELECT * FROM regions ORDER BY name ASC").all();
    res.json(regions);
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
    res.status(201).json({ message: "Region ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nama wajib diisi" });

    db.prepare("UPDATE regions SET name = ?, description = ? WHERE id = ?").run(name, description || null, id);
    res.json({ message: "Region diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM regions WHERE id = ?").run(id);
    res.json({ message: "Region dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
