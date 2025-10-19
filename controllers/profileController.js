/**
 * ==========================================================
 * 📁 controllers/profileController.js
 * ==========================================================
 * Mengelola profil user dan update password
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

// GET /api/profile/me
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      "SELECT username, staff_name, role, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ getProfile error:", err.message);
    res.status(500).json({ message: "Gagal memuat profil." });
  }
};

// PUT /api/profile/password
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    const userRes = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
    if (userRes.rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan." });

    const isValid = await bcrypt.compare(oldPassword, userRes.rows[0].password);
    if (!isValid)
      return res.status(400).json({ message: "Password lama salah." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, userId]);

    res.json({ message: "Password berhasil diperbarui." });
  } catch (err) {
    console.error("❌ updatePassword error:", err.message);
    res.status(500).json({ message: "Gagal memperbarui password." });
  }
};