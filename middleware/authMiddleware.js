// ==========================================================
// 🔐 Auth Middleware v5.3.6 (Render + NeonDB Ready)
// ==========================================================

import jwt from "jsonwebtoken";

// ==========================================================
// 🧩 Middleware Utama: Authenticate
// ----------------------------------------------------------
// Verifikasi token JWT dari header Authorization.
// ==========================================================
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";

  // Pastikan format Bearer token
  if (!authHeader.startsWith("Bearer ")) {
    console.warn("⚠️ Tidak ada Bearer token di header Authorization.");
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.warn("⚠️ Header Authorization kosong.");
    return res.status(401).json({ message: "Token kosong" });
  }

  try {
    // Verifikasi token JWT
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
// 🧩 Alias Export untuk Kompatibilitas Lama
// ----------------------------------------------------------
// Beberapa route lama masih memakai "authMiddleware"
// Jadi kita ekspor ulang untuk mencegah error:
// "does not provide an export named 'authMiddleware'"
// ==========================================================
export { authenticate as authMiddleware };

// ==========================================================
// 🧩 Role-Based Middleware
// ----------------------------------------------------------
// authorizeAdmin        → Hanya Admin
// authorizeManagement   → Admin + SemiAdmin
// ==========================================================
export function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    console.warn("🚫 Akses ditolak — hanya Admin.");
    return res.status(403).json({ message: "Akses ditolak. Hanya Admin." });
  }
  next();
}

export function authorizeManagement(req, res, next) {
  const allowed = ["admin", "semiadmin"];
  if (!req.user || !allowed.includes(req.user.role)) {
    console.warn("🚫 Akses ditolak — hanya Admin atau SemiAdmin.");
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya Admin atau SemiAdmin." });
  }
  next();
}