// controllers/regionsController.js
const db = require("../config/database");

/**
 * GET /api/regions
 * Ambil semua region
 */
exports.getAllRegions = (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM regions ORDER BY name ASC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/regions
 * Tambah region baru
 */
exports.createRegion = (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nama region wajib diisi" });

    const exists = db.prepare("SELECT id FROM regions WHERE name = ?").get(name);
    if (exists) return res.status(409).json({ message: "Region sudah ada" });

    const stmt = db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)");
    const info = stmt.run(name, description || null);

    const region = db.prepare("SELECT * FROM regions WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({ message: "Region berhasil ditambahkan", region });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PUT /api/regions/:id
 * Update region
 */
exports.updateRegion = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nama region wajib diisi" });

    const region = db.prepare("SELECT * FROM regions WHERE id = ?").get(id);
    if (!region) return res.status(404).json({ message: "Region tidak ditemukan" });

    db.prepare("UPDATE regions SET name = ?, description = ? WHERE id = ?").run(name, description || null, id);
    const updated = db.prepare("SELECT * FROM regions WHERE id = ?").get(id);

    res.json({ message: "Region diperbarui", region: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /api/regions/:id
 * Hapus region
 */
exports.deleteRegion = (req, res) => {
  try {
    const { id } = req.params;
    const region = db.prepare("SELECT * FROM regions WHERE id = ?").get(id);
    if (!region) return res.status(404).json({ message: "Region tidak ditemukan" });

    db.prepare("DELETE FROM regions WHERE id = ?").run(id);
    res.json({ message: "Region berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
