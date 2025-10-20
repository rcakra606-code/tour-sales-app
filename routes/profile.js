// ==========================================================
// 👤 Travel Dashboard Enterprise v5.1
// Profile Routes (View Profile + Change Password)
// ==========================================================

import express from "express";
import jwt from "jsonwebtoken";
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
// Middleware untuk autentikasi token JWT
// ==========================================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    req.user = user;
    next();
  });
};

// ==========================================================
// 1️⃣ GET — Ambil data profil user yang sedang login
// ==========================================================
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT id, username, staff_name, role, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "User tidak ditemukan" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ GET profile error:", err.message);
    res.status(500).json({ message: "Gagal memuat profil" });
  }
});

// ==========================================================
// 2️⃣ PUT — Ubah password user
// ==========================================================
router.put("/password", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Password lama dan baru wajib diisi" });

    const result = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
    if (!result.rows.length)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const valid = await bcrypt.compare(oldPassword, result.rows[0].password);
    if (!valid)
      return res.status(401).json({ message: "Password lama tidak sesuai" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, userId]);

    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error("❌ PUT password error:", err.message);
    res.status(500).json({ message: "Gagal mengubah password" });
  }
});

export default router;
