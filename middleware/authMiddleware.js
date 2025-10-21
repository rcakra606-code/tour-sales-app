// ==========================================================
// 🔐 Auth Middleware — Travel Dashboard Enterprise v5.4.0
// ==========================================================
// Fully ESM compatible for Render deployment
// Provides:
//  - authenticate() main middleware
//  - authMiddleware (alias for backward compatibility)
//  - authorizeAdmin() for admin-only access
//  - authorizeManagement() for admin + semiadmin
// ==========================================================

import jwt from "jsonwebtoken";

// ==========================================================
// 🧩 Middleware: Authenticate (verifikasi JWT)
// ==========================================================
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      console.warn("⚠️ Authorization header tidak valid atau kosong");
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      staff_name: decoded.staff_name,
    };

    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "jwt expired" });
    }

    return res.status(401).json({ message: "Token tidak valid" });
  }
}

// ==========================================================
// 🧩 Alias Export untuk kompatibilitas lama
// ==========================================================
export { authenticate as authMiddleware };

// ==========================================================
// 🧩 Role-Based Access Middleware
// ==========================================================

// 🔹 Hanya untuk admin
export function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    console.warn("🚫 Akses ditolak — hanya Admin");
    return res.status(403).json({ message: "Akses ditolak. Hanya Admin." });
  }
  next();
}

// 🔹 Untuk admin dan semiadmin
export function authorizeManagement(req, res, next) {
  const allowed = ["admin", "semiadmin"];
  if (!req.user || !allowed.includes(req.user.role)) {
    console.warn("🚫 Akses ditolak — hanya Admin atau SemiAdmin");
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya Admin atau SemiAdmin." });
  }
  next();
}