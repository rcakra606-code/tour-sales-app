/**
 * ==========================================================
 * 📁 controllers/authController.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Controller untuk autentikasi:
 * - Login user
 * - Verifikasi token
 * ==========================================================
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * 🔐 Login User
 * Validasi kredensial, buat token JWT
 */
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi." });

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0)
      return res.status(401).json({ message: "User tidak ditemukan." });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Password salah." });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );

    res.json({
      message: "Login berhasil.",
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Auth login error:", err.message);
    res.status(500).json({ message: "Gagal login." });
  }
};

/**
 * 🔎 Verifikasi Token JWT
 * Mengecek validitas token dan mengembalikan data user
 */
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Token tidak ditemukan." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      valid: true,
      user: decoded,
    });
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    res.status(401).json({ valid: false, message: "Token tidak valid." });
  }
};