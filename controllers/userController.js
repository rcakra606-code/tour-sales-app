/**
 * ==========================================================
 * 📁 controllers/userController.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Controller untuk modul User Management:
 * - Ambil semua user
 * - Tambah / edit user
 * - Hapus user
 * ==========================================================
 */

import bcrypt from "bcrypt";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * 👥 Ambil semua user
 */
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Gagal memuat data user:", err.message);
    res.status(500).json({ message: "Gagal memuat data user." });
  }
};

/**
 * ➕ Tambah atau edit user
 */
export const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username) {
      return res.status(400).json({ message: "Username wajib diisi." });
    }

    const userCheck = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    if (userCheck.rows.length > 0) {
      // Update user
      if (password) {
        await pool.query(
          `UPDATE users SET password=$1, role=$2 WHERE username=$3`,
          [hashedPassword, role || userCheck.rows[0].role, username]
        );
      } else {
        await pool.query(
          `UPDATE users SET role=$1 WHERE username=$2`,
          [role || userCheck.rows[0].role, username]
        );
      }
      return res.json({ message: "User berhasil diperbarui." });
    }

    // Buat user baru
    if (!password) {
      return res.status(400).json({ message: "Password wajib diisi untuk user baru." });
    }

    await pool.query(
      `INSERT INTO users (username, password, role, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [username, hashedPassword, role || "basic"]
    );

    res.status(201).json({ message: "User berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Gagal menambah/memperbarui user:", err.message);
    res.status(500).json({ message: "Gagal menambah/memperbarui user." });
  }
};

/**
 * ❌ Hapus user berdasarkan username
 */
export const deleteUser = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ message: "Username tidak ditemukan." });

    const result = await pool.query("DELETE FROM users WHERE username = $1", [username]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "User tidak ditemukan." });

    res.json({ message: "User berhasil dihapus." });
  } catch (err) {
    console.error("❌ Gagal menghapus user:", err.message);
    res.status(500).json({ message: "Gagal menghapus user." });
  }
};