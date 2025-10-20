// ==========================================================
// 👥 Travel Dashboard Enterprise v5.1
// Users Routes (CRUD + Role Management + bcrypt)
// ==========================================================

import express from "express";
import bcrypt from "bcryptjs";
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
// 1️⃣ GET — Ambil semua user
// ==========================================================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, staff_name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET users error:", err.message);
    res.status(500).json({ message: "Gagal memuat data user" });
  }
});

// ==========================================================
// 2️⃣ POST — Tambah user baru (hash password)
// ==========================================================
router.post("/", async (req, res) => {
  try {
    const { username, password, staffName, role } = req.body;

    if (!username || !password || !staffName)
      return res.status(400).json({ message: "Semua field wajib diisi" });

    const check = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (check.rows.length)
      return res.status(400).json({ message: "Username sudah digunakan" });

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (username, password, staff_name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, staff_name, role, created_at;
      `,
      [username, hashed, staffName, role || "staff"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ POST user error:", err.message);
    res.status(500).json({ message: "Gagal menambahkan user" });
  }
});

// ==========================================================
// 3️⃣ PUT — Update data user (hash ulang jika password diubah)
// ==========================================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, staffName, role } = req.body;

    const userCheck = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    if (!userCheck.rows.length)
      return res.status(404).json({ message: "User tidak ditemukan" });

    let hashed = userCheck.rows[0].password;
    if (password && password.trim() !== "") {
      hashed = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(
      `
      UPDATE users SET
        username=$1,
        password=$2,
        staff_name=$3,
        role=$4
      WHERE id=$5
      RETURNING id, username, staff_name, role, created_at;
      `,
      [username, hashed, staffName, role || "staff", id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ PUT user error:", err.message);
    res.status(500).json({ message: "Gagal memperbarui user" });
  }
});

// ==========================================================
// 4️⃣ DELETE — Hapus user
// ==========================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING id", [id]);
    if (!result.rows.length)
      return res.status(404).json({ message: "User tidak ditemukan" });

    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("❌ DELETE user error:", err.message);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
});

// ==========================================================
// 5️⃣ GET — Ambil user berdasarkan role
// ==========================================================
router.get("/role/:role", async (req, res) => {
  try {
    const { role } = req.params;
    const result = await pool.query(
      "SELECT id, username, staff_name, role FROM users WHERE role=$1 ORDER BY created_at DESC",
      [role]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET role error:", err.message);
    res.status(500).json({ message: "Gagal memuat data user berdasarkan role" });
  }
});

export default router;
