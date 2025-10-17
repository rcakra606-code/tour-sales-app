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

    const insert = db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)");
    const info = insert.run(name, description || null);

    const newRegion = db.prepare("SELECT * FROM regions WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(newRegion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nama region wajib diisi" });

    const exists = db.prepare("SELECT id FROM regions WHERE id = ?").get(id);
    if (!exists) return res.status(404).json({ message: "Region tidak ditemukan" });

    db.prepare("UPDATE regions SET name = ?, description = ? WHERE id = ?").run(name, description || null, id);
    const updated = db.prepare("SELECT * FROM regions WHERE id = ?").get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    const id = req.params.id;
    const exists = db.prepare("SELECT id FROM regions WHERE id = ?").get(id);
    if (!exists) return res.status(404).json({ message: "Region tidak ditemukan" });

    db.prepare("DELETE FROM regions WHERE id = ?").run(id);
    res.json({ message: "Region berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
