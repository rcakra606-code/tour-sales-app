/**
 * ==========================================================
 * routes/auth.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ Login & Verify API untuk PostgreSQL (Neon)
 * ✅ Menggunakan bcryptjs (bukan bcrypt)
 * ✅ JWT Auth dengan JWT_SECRET dari env
 * ✅ Aman untuk Render + CSP
 * ==========================================================
 */

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/database");

const router = express.Router();

/**
 * ==========================================================
 * POST /api/auth/login
 * Body: { username, password }
 * ==========================================================
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username dan password wajib diisi." });

    // cari user dari database
    const result = await db.query(
      "SELECT id, username, password, name, type FROM users WHERE username=$1 LIMIT 1",
      [username]
    );

    if (result.rowCount === 0)
      return res.status(401).json({ error: "User tidak ditemukan." });

    const user = result.rows[0];

    // validasi password
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Password salah." });

    // generate JWT token
    const token = jwt.sign(
      {
        username: user.username,
        type: user.type,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        username: user.username,
        name: user.name,
        type: user.type,
      },
    });
  } catch (err) {
    console.error("❌ Auth login error:", err.message);
    res.status(500).json({ error: "Terjadi kesalahan server saat login." });
  }
});

/**
 * ==========================================================
 * GET /api/auth/verify
 * Header: Authorization: Bearer <token>
 * ==========================================================
 */
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ ok: false, error: "Token tidak ditemukan." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // verifikasi user masih aktif
    const result = await db.query(
      "SELECT username, name, type FROM users WHERE username=$1 LIMIT 1",
      [decoded.username]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ ok: false, error: "User tidak ditemukan." });
    }

    res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    console.error("❌ Auth verify error:", err.message);
    res.status(401).json({ ok: false, error: "Token tidak valid atau kadaluarsa." });
  }
});

module.exports = router;
