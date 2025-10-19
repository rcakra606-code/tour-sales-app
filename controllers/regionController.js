/**
 * ==========================================================
 * controllers/regionController.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ CRUD data region
 * ✅ Fitur pencarian untuk integrasi form Tour
 * ✅ Logging aktivitas
 * ✅ PostgreSQL & SQLite hybrid support
 * ==========================================================
 */

const db = require("../config/database").getDB();
const logger = require("../config/logger");

// ============================================================
// 📘 GET /api/regions
// Ambil semua region atau cari berdasarkan query (?q=keyword)
// ============================================================
exports.getAllRegions = async (req, res) => {
  try {
    const search = req.query.q ? req.query.q.trim().toLowerCase() : "";

    let regions;
    if (search) {
      regions = await db.all("SELECT * FROM regions WHERE LOWER(name) LIKE ?", [`%${search}%`]);
      logger.info(`🔍 Pencarian region: '${search}' (${regions.length} hasil)`);
    } else {
      regions = await db.all("SELECT * FROM regions ORDER BY name ASC");
      logger.info("📋 Mengambil semua region");
    }

    res.json(regions);
  } catch (err) {
    logger.error("❌ Error mengambil data region:", err);
    res.status(500).json({ message: "Gagal mengambil data region" });
  }
};

// ============================================================
// 🟢 POST /api/regions
// Tambah region baru
// ============================================================
exports.createRegion = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Nama region wajib diisi" });
    }

    const existing = await db.get("SELECT * FROM regions WHERE LOWER(name) = ?", [name.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ message: "Region dengan nama tersebut sudah ada" });
    }

    await db.run("INSERT INTO regions (name, description) VALUES (?, ?)", [name.trim(), description || null]);
    logger.info(`✅ Region '${name}' berhasil ditambahkan`);
    res.json({ message: "✅ Region berhasil ditambahkan" });
  } catch (err) {
    logger.error("❌ Error menambahkan region:", err);
    res.status(500).json({ message: "Gagal menambahkan region" });
  }
};

// ============================================================
// 🟡 PUT /api/regions/:id
// Update data region
// ============================================================
exports.updateRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const region = await db.get("SELECT * FROM regions WHERE id = ?", [id]);
    if (!region) {
      return res.status(404).json({ message: "Region tidak ditemukan" });
    }

    await db.run("UPDATE regions SET name = ?, description = ? WHERE id = ?", [name || region.name, description || region.description, id]);
    logger.info(`✏️ Region '${region.name}' diperbarui menjadi '${name}'`);
    res.json({ message: "✅ Data region berhasil diperbarui" });
  } catch (err) {
    logger.error("❌ Error memperbarui region:", err);
    res.status(500).json({ message: "Gagal memperbarui data region" });
  }
};

// ============================================================
// 🔴 DELETE /api/regions/:id
// Hapus region
// ============================================================
exports.deleteRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const region = await db.get("SELECT * FROM regions WHERE id = ?", [id]);
    if (!region) {
      return res.status(404).json({ message: "Region tidak ditemukan" });
    }

    await db.run("DELETE FROM regions WHERE id = ?", [id]);
    logger.info(`🗑️ Region '${region.name}' dihapus`);
    res.json({ message: "✅ Region berhasil dihapus" });
  } catch (err) {
    logger.error("❌ Error menghapus region:", err);
    res.status(500).json({ message: "Gagal menghapus region" });
  }
};
