/**
 * ==========================================================
 * 📁 controllers/profileController.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Controller untuk modul Profile:
 * - Ambil data user login
 * - Ubah password user
 * ==========================================================
 */

import bcrypt from "bcrypt";
import pkg from "pg";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * 👤 Ambil data profil user berdasarkan token JWT
 */
export const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token tidak ditemukan." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query("SELECT username, role, created_at FROM users WHERE id = $1", [
      decoded.id,
    ]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan." });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Gagal memuat profil user:", err.message);
    res.status(500).json({ message: "Gagal memuat data profil user." });
  }
};

/**
 * 🔒 Update password user
 */
export const updatePassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token tidak ditemukan." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Password lama dan baru wajib diisi." });

    const result = await pool.query("SELECT password FROM users WHERE id = $1", [decoded.id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan." });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) return res.status(401).json({ message: "Password lama salah." });

    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, decoded.id]);

    res.json({ message: "Password berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Gagal memperbarui password:", err.message);
    res.status(500).json({ message: "Gagal memperbarui password." });
  }
};
