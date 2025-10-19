/**
 * ==========================================================
 * middleware/authMiddleware.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Verifikasi token JWT
 * ✅ Menolak akses tanpa autentikasi
 * ✅ Logging error autentikasi
 * ✅ Integrasi untuk roleCheck
 * ==========================================================
 */

const jwt = require("jsonwebtoken");
const logger = require("../config/logger");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ============================================================
// 🔒 Middleware: verifyToken
// ============================================================
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      logger.warn("🚫 Akses ditolak: token tidak ditemukan");
      return res.status(401).json({ message: "Akses ditolak, token tidak ditemukan" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        logger.warn("🚫 Akses ditolak: token tidak valid atau kadaluwarsa");
        return res.status(403).json({ message: "Token tidak valid atau kadaluwarsa" });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    logger.error("❌ Error verifying token:", err);
    res.status(500).json({ message: "Gagal memverifikasi token" });
  }
};
