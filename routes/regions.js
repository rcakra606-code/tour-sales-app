// ==========================================================
// 🌍 Regions Routes — v5.3.6 (Render + NeonDB Ready)
// ==========================================================
import express from "express";
import { authenticate, authorizeManagement } from "../middleware/authMiddleware.js";
import pkg from "pg";
const { Pool } = pkg;

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🧭 GET /api/regions
// ----------------------------------------------------------
// List semua region
// ==========================================================
router.get("/", authenticate, async (req, res) => {
  try {
    const q = `SELECT id, name, description FROM regions ORDER BY name ASC;`;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ GET /api/regions error:", err);
    res.status(500).json({ message: "Gagal memuat data region" });
  }
});

// ==========================================================
// ➕ POST /api/regions
// ----------------------------------------------------------
// Tambah region baru (Admin / SemiAdmin)
// ==========================================================
router.post("/", authenticate, authorizeManagement, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === "")
      return res.status(400).json({ message: "Nama region wajib diisi" });

    const q = `INSERT INTO regions (name, description) VALUES ($1, $2)
               RETURNING id, name, description;`;
    const { rows } = await pool.query(q, [name.trim(), description || ""]);

    res.status(201).json({
      message: "Region berhasil ditambahkan",
      data: rows[0],
    });
  } catch (err) {
    console.error("❌ POST /api/regions error:", err);
    res.status(500).json({ message: "Gagal menambahkan region" });
  }
});

// ==========================================================
// 🗑️ DELETE /api/regions/:id
// ----------------------------------------------------------
// Hapus region (Admin / SemiAdmin)
// ==========================================================
router.delete("/:id", authenticate, authorizeManagement, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID tidak valid" });

    await pool.query(`DELETE FROM regions WHERE id = $1;`, [id]);
    res.json({ message: "Region berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE /api/regions error:", err);
    res.status(500).json({ message: "Gagal menghapus region" });
  }
});

// ==========================================================
// 🧾 GET /api/regions/:id
// ----------------------------------------------------------
// Detail region berdasarkan ID
// ==========================================================
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID tidak valid" });

    const q = `SELECT id, name, description FROM regions WHERE id = $1 LIMIT 1;`;
    const { rows } = await pool.query(q, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Region tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ GET /api/regions/:id error:", err);
    res.status(500).json({ message: "Gagal memuat detail region" });
  }
});

export default router;