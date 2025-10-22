// ==========================================================
// 🔐 Auth Controller — Travel Dashboard Enterprise v5.4.8
// ==========================================================

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../server.js";

// ==========================================================
// 🔹 LOGIN USER
// ==========================================================
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi." });

    const userQuery = await pool.query(
      "SELECT id, username, password_hash, role, staff_name FROM users WHERE LOWER(username) = LOWER($1)",
      [username]
    );

    if (userQuery.rows.length === 0)
      return res.status(401).json({ message: "Username tidak ditemukan." });

    const user = userQuery.rows[0];

    // Pastikan password hash adalah string
    const hash = typeof user.password_hash === "string" ? user.password_hash : String(user.password_hash);

    const isMatch = await bcrypt.compare(String(password), hash);
    if (!isMatch)
      return res.status(401).json({ message: "Password salah." });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        staff_name: user.staff_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );

    res.json({
      message: "Login berhasil.",
      token,
      role: user.role,
      staff_name: user.staff_name,
    });
  } catch (err) {
    console.error("❌ Auth login error:", err);
    res.status(500).json({ message: "Terjadi kesalahan saat login." });
  }
}

// ==========================================================
// 🔹 REGISTER USER (Opsional untuk Admin)
// ==========================================================
export async function register(req, res) {
  try {
    const { username, password, role, staff_name } = req.body;

    if (!username || !password || !role)
      return res.status(400).json({ message: "Semua field wajib diisi." });

    const hash = await bcrypt.hash(String(password), 10);

    await pool.query(
      "INSERT INTO users (username, password_hash, role, staff_name) VALUES ($1, $2, $3, $4)",
      [username, hash, role, staff_name || ""]
    );

    res.json({ message: "User berhasil dibuat." });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Gagal membuat user baru." });
  }
}

// ==========================================================
// 🔹 VERIFY TOKEN (Untuk Auto-Login Frontend)
// ==========================================================
export async function verifyToken(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Token tidak ditemukan." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      valid: true,
      user: decoded,
    });
  } catch (err) {
    console.error("❌ Verify token error:", err.message);
    res.status(401).json({ valid: false, message: "Token tidak valid atau sudah kedaluwarsa." });
  }
}