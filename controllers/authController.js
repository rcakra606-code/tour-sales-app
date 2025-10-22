// ==========================================================
// 🔐 Auth Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Login user dengan bcryptjs + JWT
// - Validasi password_hash
// - Generate access & refresh token
// - Return role + staff_name ke frontend
// - Aman untuk Render + NeonDB
// ==========================================================

import pkg from "pg";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const bcrypt = bcryptjs;
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// ==========================================================
// 🧩 Helper: Token Generator
// ==========================================================
function generateTokens(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    staff_name: user.staff_name,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

  return { accessToken, refreshToken };
}

// ==========================================================
// 🔹 POST /api/auth/login
// ==========================================================
export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi." });
  }

  try {
    const query = `
      SELECT id, username, staff_name, password_hash, role
      FROM users
      WHERE LOWER(username) = LOWER($1)
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "User tidak ditemukan." });
    }

    const user = rows[0];

    if (!user.password_hash || typeof user.password_hash !== "string") {
      return res.status(500).json({ message: "Password user belum diatur dengan benar." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Password salah." });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json({
      message: "Login berhasil",
      token: accessToken,
      refresh_token: refreshToken,
      username: user.username,
      role: user.role,
      staff_name: user.staff_name,
    });
  } catch (err) {
    console.error("❌ Auth login error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server saat login." });
  }
}

// ==========================================================
// 🔹 POST /api/auth/refresh — Perpanjang Token
// ==========================================================
export async function refreshToken(req, res) {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token tidak ditemukan." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userQuery = `
      SELECT id, username, staff_name, role
      FROM users WHERE id = $1;
    `;
    const { rows } = await pool.query(userQuery, [decoded.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const user = rows[0];
    const { accessToken, refreshToken } = generateTokens(user);
    res.json({
      token: accessToken,
      refresh_token: refreshToken,
      username: user.username,
      role: user.role,
      staff_name: user.staff_name,
    });
  } catch (err) {
    console.error("❌ Refresh token error:", err);
    res.status(401).json({ message: "Token tidak valid atau telah kedaluwarsa." });
  }
}

// ==========================================================
// 🔹 GET /api/auth/verify — Cek Validitas Token
// ==========================================================
export async function verify(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    console.error("❌ Verify token error:", err);
    res.status(401).json({ valid: false, message: "Token tidak valid atau kedaluwarsa." });
  }
}