// ==========================================================
// 👥 Users Routes — Travel Dashboard Enterprise v5.4.0
// ==========================================================
// Endpoint utama untuk manajemen user
// ----------------------------------------------------------
//   GET    /api/users          → List semua user (Admin & SemiAdmin)
//   GET    /api/users/:id      → Detail user tertentu
//   POST   /api/users          → Tambah user baru (Admin & SemiAdmin)
//   PUT    /api/users/:id      → Update user (Admin saja)
//   DELETE /api/users/:id      → Hapus user (Admin saja)
// ==========================================================

import express from "express";
import {
  authenticate,
  authorizeAdmin,
  authorizeManagement,
} from "../middleware/authMiddleware.js";
import pkg from "pg";
import bcryptjs from "bcryptjs";
const bcrypt = bcryptjs;

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const router = express.Router();

// ==========================================================
// 🔹 GET /api/users — List semua user (Admin & SemiAdmin)
// ==========================================================
router.get("/", authenticate, authorizeManagement, async (req, res) => {
  try {
    const q = `
      SELECT id, username, staff_name, role, created_at
      FROM users
      ORDER BY id ASC;
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ GET /api/users error:", err);
    res.status(500).json({ message: "Gagal memuat data user" });
  }
});

// ==========================================================
// 🔹 GET /api/users/:id — Detail user
// ==========================================================
router.get("/:id", authenticate, authorizeManagement, async (req, res) => {
  try {
    const { id } = req.params;
    const q = `
      SELECT id, username, staff_name, role, created_at
      FROM users
      WHERE id = $1;
    `;
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ GET /api/users/:id error:", err);
    res.status(500).json({ message: "Gagal memuat data user" });
  }
});

// ==========================================================
// 🔹 POST /api/users — Tambah user baru
// ==========================================================
router.post("/", authenticate, authorizeManagement, async (req, res) => {
  try {
    const { username, staff_name, password, role } = req.body;

    if (!username || !password || !role)
      return res.status(400).json({ message: "Data tidak lengkap" });

    const hashed = await bcrypt.hash(password, 10);
    const q = `
      INSERT INTO users (username, staff_name, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, staff_name, role;
    `;
    const { rows } = await pool.query(q, [
      username,
      staff_name || username,
      hashed,
      role,
    ]);
    res.status(201).json({ message: "User berhasil dibuat", user: rows[0] });
  } catch (err) {
    console.error("❌ POST /api/users error:", err);
    if (err.code === "23505") {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }
    res.status(500).json({ message: "Gagal menambahkan user baru" });
  }
});

// ==========================================================
// 🔹 PUT /api/users/:id — Update user
// ==========================================================
router.put("/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_name, password, role } = req.body;

    // Ambil data lama
    const userOld = await pool.query(
      "SELECT * FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    if (userOld.rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    let passwordHash = userOld.rows[0].password_hash;
    if (password && password.trim() !== "") {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const q = `
      UPDATE users
      SET staff_name = $1, password_hash = $2, role = $3
      WHERE id = $4
      RETURNING id, username, staff_name, role;
    `;
    const values = [staff_name, passwordHash, role, id];
    const { rows } = await pool.query(q, values);

    res.json({ message: "User berhasil diperbarui", user: rows[0] });
  } catch (err) {
    console.error("❌ PUT /api/users/:id error:", err);
    res.status(500).json({ message: "Gagal memperbarui user" });
  }
});

// ==========================================================
// 🔹 DELETE /api/users/:id — Hapus user
// ==========================================================
router.delete("/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const q = `DELETE FROM users WHERE id = $1;`;
    await pool.query(q, [id]);
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE /api/users/:id error:", err);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
});

export default router;