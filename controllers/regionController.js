// controllers/regionController.js — Final Production Version
const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/**
 * Pastikan tabel regions ada
 */
function ensureTable() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();
}
ensureTable();

/**
 * GET /api/regions
 * Ambil daftar region
 */
exports.getRegions = (req, res) => {
  try {
    const regions = db.prepare("SELECT * FROM regions ORDER BY name ASC").all();
    res.json(regions);
  } catch (err) {
    console.error("getRegions error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data region." });
  }
};

/**
 * POST /api/regions
 * Tambah region baru
 */
exports.createRegion = (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === "")
      return res.status(400).json({ error: "Nama region wajib diisi." });

    const exists = db.prepare("SELECT id FROM regions WHERE name = ?").get(name.trim());
    if (exists) return res.status(400).json({ error: "Region sudah ada." });

    db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)").run(name.trim(), description || "");
    res.json({ ok: true, message: "Region berhasil ditambahkan." });
  } catch (err) {
    console.error("createRegion error:", err.message);
    res.status(500).json({ error: "Gagal menambahkan region." });
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
    if (!id || !name) return res.status(400).json({ error: "ID dan nama wajib diisi." });

    db.prepare("UPDATE regions SET name = ?, description = ? WHERE id = ?").run(name.trim(), description || "", id);
    res.json({ ok: true, message: "Region berhasil diperbarui." });
  } catch (err) {
    console.error("updateRegion error:", err.message);
    res.status(500).json({ error: "Gagal memperbarui region." });
  }
};

/**
 * DELETE /api/regions/:id
 * Hapus region
 */
exports.deleteRegion = (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID tidak diberikan." });

    db.prepare("DELETE FROM regions WHERE id = ?").run(id);
    res.json({ ok: true, message: "Region dihapus." });
  } catch (err) {
    console.error("deleteRegion error:", err.message);
    res.status(500).json({ error: "Gagal menghapus region." });
  }
};
