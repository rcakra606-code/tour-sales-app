// ==========================================================
// 🛡️ Auth Middleware — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Verifikasi token JWT
// - Role-based access (Admin, SemiAdmin, Staff)
// - Integrasi penuh dengan semua route API
// ==========================================================

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ==========================================================
// 🔹 Middleware: Autentikasi Token
// ==========================================================
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Akses ditolak: token tidak ditemukan." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token sudah kedaluwarsa." });
    }
    return res.status(401).json({ message: "Token tidak valid." });
  }
}

// ==========================================================
// 🔹 Middleware: Role Authorization (Admin Only)
// ==========================================================
export function authorizeAdmin(req, res, next) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak: hanya admin yang dapat mengakses." });
    }
    next();
  } catch (err) {
    console.error("❌ Role check error (Admin):", err.message);
    res.status(403).json({ message: "Akses ditolak: admin saja." });
  }
}

// ==========================================================
// 🔹 Middleware: Role Authorization (Admin + SemiAdmin)
// ==========================================================
export function authorizeManagement(req, res, next) {
  try {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "semiadmin")) {
      return res.status(403).json({
        message: "Akses ditolak: hanya admin atau semiadmin yang dapat mengakses.",
      });
    }
    next();
  } catch (err) {
    console.error("❌ Role check error (Management):", err.message);
    res.status(403).json({ message: "Akses ditolak: tidak memiliki hak manajemen." });
  }
}

// ==========================================================
// 🔹 Middleware: Role Authorization (Staff Only)
// ==========================================================
export function authorizeStaff(req, res, next) {
  try {
    if (!req.user || req.user.role !== "staff") {
      return res.status(403).json({ message: "Akses ditolak: hanya staff yang dapat mengakses." });
    }
    next();
  } catch (err) {
    console.error("❌ Role check error (Staff):", err.message);
    res.status(403).json({ message: "Akses ditolak: tidak memiliki hak akses staff." });
  }
}