/**
 * ==========================================================
 * middleware/auth.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ Verifikasi token JWT
 * ✅ Validasi user ke Neon PostgreSQL
 * ✅ Inject user info ke req.user
 * ✅ Handle token expired / invalid
 * ==========================================================
 */

const jwt = require("jsonwebtoken");
const db = require("../config/db");

/**
 * Middleware untuk memverifikasi JWT token dan ambil user info
 */
module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token tidak ditemukan atau tidak valid" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Token tidak valid atau kadaluarsa" });
    }

    // Ambil data user dari database (Neon PostgreSQL)
    const result = await db.query(
      "SELECT username, name, type FROM users WHERE username=$1 LIMIT 1",
      [decoded.username]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "User tidak ditemukan atau sudah dihapus" });
    }

    // Inject user ke request object
    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error("❌ Error di middleware auth:", err.message);
    res.status(500).json({ error: "Terjadi kesalahan saat verifikasi autentikasi" });
  }
};
