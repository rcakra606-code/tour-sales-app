// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * Middleware autentikasi utama
 * Memverifikasi JWT dari header Authorization.
 * Jika valid, lanjutkan ke handler berikutnya.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";

  // Pastikan ada token Bearer
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token kosong" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);

    // Deteksi error JWT spesifik
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "jwt expired" });
    }

    return res.status(401).json({ message: "Token tidak valid" });
  }
}

/**
 * Middleware untuk memastikan hanya Admin
 */
export function authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses khusus Admin" });
  }
  next();
}

/**
 * Middleware untuk Admin dan SemiAdmin
 */
export function authorizeManagement(req, res, next) {
  if (!["admin", "semiadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Akses khusus Admin atau SemiAdmin" });
  }
  next();
}