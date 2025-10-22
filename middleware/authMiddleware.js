// ==========================================================
// 🔐 Auth Middleware — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - JWT authentication
// - Role-based access control
// - Admin-only access
// ==========================================================

import jwt from "jsonwebtoken";

// ==========================================================
// 🔹 AUTHENTICATE TOKEN
// ==========================================================
export function authenticate(req, res, next) {
const authHeader = req.headers.authorization;
const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
  if (!token)
return res.status(401).json({ message: "Token tidak ditemukan." });
  }

try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // user: { id, username, role, staff_name }
    req.user = decoded;
next();
} catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    return res.status(401).json({ message: "Token tidak valid atau sudah kadaluarsa." });
    console.error("❌ Auth error:", err.message);
    res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
}
}

// ==========================================================
// 🔹 AUTHORIZE BY ROLE
// ==========================================================
export function authorize(roles = []) {
return (req, res, next) => {
if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Akses ditolak. Hak akses tidak mencukupi." });
      return res.status(403).json({ message: "Akses ditolak." });
}
next();
};
}

// ==========================================================
// 🔹 AUTHORIZE ADMIN ONLY
// ==========================================================
export function authorizeAdmin(req, res, next) {
if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses khusus admin." });
    return res.status(403).json({ message: "Hanya admin yang dapat mengakses." });
}
next();
}
