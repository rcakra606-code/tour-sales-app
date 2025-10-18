/**
 * ==========================================================
 * routes/auth.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ PostgreSQL (Neon) via config/database.js
 * ✅ bcryptjs (Render-safe hashing)
 * ✅ JWT-based authentication
 * ✅ Role verification
 * ==========================================================
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { logAction } = require("../middleware/log");

const router = express.Router();

// ==========================================================
// POST /api/auth/login
// ==========================================================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username dan password wajib diisi" });

    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rowCount === 0)
      return res.status(401).json({ error: "User tidak ditemukan" });

    const user = result.rows[0];
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Password salah" });

    const token = jwt.sign(
      { username: user.username, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await logAction(user, "Login", user.username);
    res.json({
      message: "✅ Login berhasil",
      token,
      user: { username: user.username, name: user.name, type: user.type },
    });
  } catch (err) {
    console.error("❌ Error during login:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat login" });
  }
});

// ==========================================================
// GET /api/auth/verify
// Verifikasi token JWT dari localStorage frontend
// ==========================================================
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ ok: false });

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await db.query("SELECT username, name, type FROM users WHERE username = $1", [decoded.username]);
    if (result.rowCount === 0)
      return res.status(401).json({ ok: false });

    res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    res.status(401).json({ ok: false, error: "Token tidak valid atau kadaluarsa" });
  }
});

// ==========================================================
// POST /api/auth/logout
// Hanya untuk frontend clear session
// ==========================================================
router.post("/logout", async (req, res) => {
  try {
    res.json({ message: "✅ Logout berhasil (hapus token di client)" });
  } catch (err) {
    res.status(500).json({ error: "Gagal logout" });
  }
});

module.exports = router;
