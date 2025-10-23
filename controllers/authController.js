// ==========================================================
// 🔐 Auth Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { pool } from "../server.js";

dotenv.config();

// ===== Generate JWT =====
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      staff_name: user.staff_name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
}

// ===== Refresh Token =====
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
}

// ===== LOGIN =====
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Masukkan username dan password." });

    const userResult = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userResult.rows.length === 0)
      return res.status(401).json({ message: "Username tidak ditemukan." });

    const user = userResult.rows[0];

    // ✅ Fix: password_hash digunakan sesuai schema baru
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Password salah." });

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      message: "Login berhasil.",
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        staff_name: user.staff_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Auth login error:", err);
    res.status(500).json({ message: "Gagal memproses login." });
  }
}

// ===== VERIFY TOKEN =====
export async function verifyToken(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Token tidak ditemukan." });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        return res.status(401).json({ message: "Token tidak valid atau sudah kadaluarsa." });

      res.json({ valid: true, user: decoded });
    });
  } catch (err) {
    console.error("❌ Verify token error:", err);
    res.status(500).json({ message: "Gagal memverifikasi token." });
  }
}

// ===== REFRESH TOKEN =====
export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token tidak ditemukan." });

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({ message: "Refresh token tidak valid." });

      const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
      if (userResult.rows.length === 0)
        return res.status(404).json({ message: "User tidak ditemukan." });

      const user = userResult.rows[0];
      const newToken = generateToken(user);
      res.json({ token: newToken });
    });
  } catch (err) {
    console.error("❌ Refresh token error:", err);
    res.status(500).json({ message: "Gagal memperbarui token." });
  }
}

// ===== REGISTER (Opsional - Admin Only) =====
export async function register(req, res) {
  try {
    const { username, password, staff_name, role } = req.body;

    const existing = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "Username sudah digunakan." });

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password_hash, staff_name, role) VALUES ($1,$2,$3,$4)",
      [username, hashedPassword, staff_name || "", role || "staff"]
    );

    res.json({ message: "Registrasi berhasil." });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Gagal mendaftarkan user baru." });
  }
}