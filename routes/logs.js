// ==========================================================
// 🪵 Travel Dashboard Enterprise v5.1
// Logs Routes (Audit Trail CRUD + Filter)
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
// 1️⃣ GET — Ambil semua log (dengan filter user & tanggal)
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const { user = "", date = "" } = req.query;
    const params = [];
    let query = `
      SELECT * FROM logs
      WHERE 1=1
    `;

    if (user) {
      params.push(`%${user}%`);
      query += ` AND username ILIKE $${params.length}`;
    }

    if (date) {
      params.push(`${date}`);
      query += ` AND DATE(timestamp) = $${params.length}::date`;
    }

    query += " ORDER BY timestamp DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET logs error:", err.message);
    res.status(500).json({ message: "Gagal memuat data log" });
  }
});

// ==========================================================
// 2️⃣ POST — Tambah log baru (catat aktivitas)
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const { username, action, description, ip } = req.body;

    const result = await pool.query(
      `
      INSERT INTO logs (username, action, description, ip)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [username || "SYSTEM", action || "-", description || "-", ip || "unknown"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ POST log error:", err.message);
    res.status(500).json({ message: "Gagal mencatat log" });
  }
});

// ==========================================================
// 3️⃣ DELETE — Hapus log tertentu (opsional, hanya admin)
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM logs WHERE id=$1 RETURNING id", [id]);

    if (!result.rows.length)
      return res.status(404).json({ message: "Log tidak ditemukan" });

    res.json({ message: "Log berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE log error:", err.message);
    res.status(500).json({ message: "Gagal menghapus log" });
  }
});

export default router;