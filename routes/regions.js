// ==========================================================
// 🌍 Travel Dashboard Enterprise v5.1
// Region Routes (CRUD + Search)
// ==========================================================

import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 1️⃣ GET — Ambil semua region (dengan search opsional)
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const { search = "" } = req.query;
    let query = "SELECT * FROM regions WHERE 1=1";
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length})`;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET regions error:", err.message);
    res.status(500).json({ message: "Gagal memuat data region" });
  }
});

// ==========================================================
// 2️⃣ POST — Tambah region baru
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || name.trim() === "")
      return res.status(400).json({ message: "Nama region wajib diisi" });

    const result = await pool.query(
      `INSERT INTO regions (name, code)
       VALUES ($1, $2)
       RETURNING *;`,
      [name.trim(), code || ""]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ POST region error:", err.message);
    res.status(500).json({ message: "Gagal menambahkan data region" });
  }
});

// ==========================================================
// 3️⃣ PUT — Update region
// ==========================================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const check = await pool.query("SELECT * FROM regions WHERE id=$1", [id]);
    if (!check.rows.length)
      return res.status(404).json({ message: "Region tidak ditemukan" });

    const result = await pool.query(
      `
      UPDATE regions
      SET name=$1, code=$2
      WHERE id=$3
      RETURNING *;
      `,
      [name || check.rows[0].name, code || check.rows[0].code, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ PUT region error:", err.message);
    res.status(500).json({ message: "Gagal memperbarui data region" });
  }
});

// ==========================================================
// 4️⃣ DELETE — Hapus region
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM regions WHERE id=$1 RETURNING id", [id]);

    if (!result.rows.length)
      return res.status(404).json({ message: "Region tidak ditemukan" });

    res.json({ message: "Region berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE region error:", err.message);
    res.status(500).json({ message: "Gagal menghapus data region" });
  }
});

export default router;