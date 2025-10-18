/**
 * ==========================================================
 * routes/regions.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ PostgreSQL (Neon) Ready
 * ✅ CRUD Region Management
 * ✅ Role-based Access Control
 * ✅ Audit Logging Integration
 * ==========================================================
 */

const express = require("express");
const db = require("../config/database");
const auth = require("../middleware/auth");
const { logAction } = require("../middleware/log");
const { requireRole } = require("../middleware/roleCheck");

const router = express.Router();

// Middleware Auth untuk semua route
router.use(auth);

/**
 * ==========================================================
 * GET /api/regions
 * Ambil semua data region (termasuk untuk dropdown Tour)
 * ==========================================================
 */
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, description FROM regions ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error GET /regions:", err.message);
    res.status(500).json({ error: "Gagal memuat data region" });
  }
});

/**
 * ==========================================================
 * GET /api/regions/:id
 * Ambil detail region berdasarkan ID
 * ==========================================================
 */
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM regions WHERE id=$1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Region tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error GET /regions/:id:", err.message);
    res.status(500).json({ error: "Gagal mengambil detail region" });
  }
});

/**
 * ==========================================================
 * POST /api/regions
 * Tambah region baru (super/semi)
 * ==========================================================
 */
router.post("/", requireRole("super", "semi"), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === "")
      return res.status(400).json({ error: "Nama region wajib diisi" });

    const result = await db.query(
      "INSERT INTO regions (name, description) VALUES ($1, $2) RETURNING id",
      [name.trim(), description || null]
    );

    await logAction(req.user, "Menambahkan Region", `Region: ${name}`);
    res.json({ message: "✅ Region berhasil ditambahkan", id: result.rows[0].id });
  } catch (err) {
    console.error("❌ Error POST /regions:", err.message);
    res.status(500).json({ error: "Gagal menambahkan region" });
  }
});

/**
 * ==========================================================
 * PUT /api/regions/:id
 * Update region (super/semi)
 * ==========================================================
 */
router.put("/:id", requireRole("super", "semi"), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;

    const result = await db.query("SELECT * FROM regions WHERE id=$1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Region tidak ditemukan" });

    await db.query("UPDATE regions SET name=$1, description=$2 WHERE id=$3", [
      name || result.rows[0].name,
      description || result.rows[0].description,
      id,
    ]);

    await logAction(req.user, "Memperbarui Region", `Region ID: ${id}`);
    res.json({ message: "✅ Region berhasil diperbarui" });
  } catch (err) {
    console.error("❌ Error PUT /regions/:id:", err.message);
    res.status(500).json({ error: "Gagal memperbarui region" });
  }
});

/**
 * ==========================================================
 * DELETE /api/regions/:id
 * Hapus region (super only)
 * ==========================================================
 */
router.delete("/:id", requireRole("super"), async (req, res) => {
  try {
    const id = req.params.id;
    const region = await db.query("SELECT name FROM regions WHERE id=$1", [id]);
    if (region.rowCount === 0) return res.status(404).json({ error: "Region tidak ditemukan" });

    await db.query("DELETE FROM regions WHERE id=$1", [id]);
    await logAction(req.user, "Menghapus Region", region.rows[0].name);

    res.json({ message: "🗑️ Region berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error DELETE /regions/:id:", err.message);
    res.status(500).json({ error: "Gagal menghapus region" });
  }
});

module.exports = router;
