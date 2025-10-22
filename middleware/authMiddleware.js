// ==========================================================
// 🛡️ Auth Middleware — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Validasi JWT Token (Bearer Token)
// - Akses terbatas berdasarkan role (admin, semiadmin, staff)
// - Penanganan error token kedaluwarsa
// ==========================================================

import jwt from "jsonwebtoken";
import pkg from "pg";
const { Pool } = pkg;

// Pool connection ke NeonDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 Middleware Utama — Autentikasi
// ==========================================================
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token tidak valid." });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cek user masih aktif di DB
    const userRes = await pool.query(
      "SELECT id, username, role, staff_name FROM users WHERE id = $1",
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: "User tidak ditemukan atau tidak aktif." });
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Sesi login telah berakhir. Silakan login kembali." });
    }

    return res.status(401).json({ message: "Token tidak valid." });
  }
}

// ==========================================================
// 🔹 Middleware Role Based Access
// ==========================================================
// Contoh penggunaan:
// router.post("/admin-action", authorize(["admin"]), handler);
export function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Akses ditolak. Role tidak memiliki izin." });
    }
    next();
  };
}