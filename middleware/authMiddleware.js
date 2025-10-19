/**
 * ==========================================================
 * 📁 middleware/authMiddleware.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Middleware untuk autentikasi berbasis JWT:
 * - Mengecek token JWT
 * - Melanjutkan request jika token valid
 * ==========================================================
 */

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔐 Middleware Autentikasi
 * Menolak akses jika token tidak ada atau tidak valid.
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token tidak ditemukan." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
  }
};