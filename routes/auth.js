// ==========================================================
// 🔐 Travel Dashboard Enterprise v5.1
// Auth Routes (JWT + bcrypt + PostgreSQL)
// ==========================================================

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
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
// Helper Functions
// ==========================================================
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );

// ==========================================================
// Middleware for verifying access token
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
// Login Route
// ==========================================================
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi" });

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];

    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Password salah" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Simpan refresh token di DB (opsional)
    await pool.query(
      "UPDATE users SET created_at = NOW() WHERE id = $1",
      [user.id]
    );

    res.json({
      message: "Login berhasil",
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        staff_name: user.staff_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Auth login error:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// ==========================================================
// Token Verification
// ==========================================================
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

// ==========================================================
// Refresh Token
// ==========================================================
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token tidak ditemukan" });

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Refresh token tidak valid" });

    const accessToken = generateAccessToken(user);
    res.json({ token: accessToken });
  });
});

// ==========================================================
// Logout
// ==========================================================
router.post("/logout", (req, res) => {
  // JWT-based stateless logout
  res.json({ message: "Logout berhasil (hapus token di client)" });
});

// ==========================================================
// Forgot Password (optional future feature)
// ==========================================================
// router.post("/forgot-password", async (req, res) => { ... });

// ==========================================================
// Export router
// ==========================================================
export default router;