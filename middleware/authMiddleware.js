// ==========================================================
// 🔐 Auth Middleware — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ===== AUTENTIKASI USER DENGAN JWT =====
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Token tidak ditemukan. Harap login ulang." });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.warn("⚠️ Auth middleware error:", err.message);
        return res.status(401).json({ message: "Token tidak valid atau sudah kadaluarsa." });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    console.error("❌ Auth middleware fatal error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada autentikasi." });
  }
}

// ===== IZIN UNTUK ADMIN =====
export function authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Akses khusus admin." });
  next();
}

// ===== IZIN UNTUK SEMI ADMIN =====
export function authorizeSemiAdmin(req, res, next) {
  if (req.user.role !== "semi-admin" && req.user.role !== "admin")
    return res.status(403).json({ message: "Akses khusus semi-admin atau admin." });
  next();
}