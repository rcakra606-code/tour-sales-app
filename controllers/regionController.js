// controllers/regionsController.js
const db = require("../config/database");
const { logger } = require("../config/logger");

exports.getAll = (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM regions ORDER BY id DESC").all();
    res.json(rows);
  } catch (err) {
    logger?.error?.("regions.getAll failed: " + err.message);
    res.status(500).json({ message: "Gagal mengambil regions" });
  }
};

exports.create = (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nama region wajib diisi" });

    const exists = db.prepare("SELECT id FROM regions WHERE name = ?").get(name);
    if (exists) return res.status(409).json({ message: "Nama region sudah ada" });

    db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)").run(name, description || null);
    res.json({ message: "Region berhasil ditambahkan" });
  } catch (err) {
    logger?.error?.("regions.create failed: " + err.message);
    res.status(500).json({ message: "Gagal menambah region" });
  }
};

exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const region = db.prepare("SELECT * FROM regions WHERE id = ?").get(id);
    if (!region) return res.status(404).json({ message: "Region tidak ditemukan" });

    db.prepare("UPDATE regions SET name = ?, description = ? WHERE id = ?").run(name || region.name, description || region.description, id);
    res.json({ message: "Region berhasil diperbarui" });
  } catch (err) {
    logger?.error?.("regions.update failed: " + err.message);
    res.status(500).json({ message: "Gagal memperbarui region" });
  }
};

exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const region = db.prepare("SELECT id FROM regions WHERE id = ?").get(id);
    if (!region) return res.status(404).json({ message: "Region tidak ditemukan" });

    db.prepare("DELETE FROM regions WHERE id = ?").run(id);
    res.json({ message: "Region berhasil dihapus" });
  } catch (err) {
    logger?.error?.("regions.delete failed: " + err.message);
    res.status(500).json({ message: "Gagal menghapus region" });
  }
};
