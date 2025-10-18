// =====================================
// ✅ JWT Authentication + Role Middleware
// =====================================
const jwt = require("jsonwebtoken");

// -------------------------------------
// 🔐 Autentikasi JWT
// -------------------------------------
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ ok: false, error: "Token tidak ditemukan" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // simpan user info di req
    next();
  } catch (err) {
    return res.status(403).json({ ok: false, error: "Token tidak valid" });
  }
};

      return res.status(401).json({ message: "Akses ditolak. Token tidak ada." });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "secretkey";

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token kedaluwarsa. Silakan login ulang." });
        }
        return res.status(403).json({ message: "Token tidak valid." });
      }

      // Simpan payload token ke request (id, username, role)
      req.user = decoded;
      next();
    });
  } catch (e) {
    console.error("❌ Auth middleware error:", e);
    return res.status(500).json({ message: "Kesalahan server pada autentikasi." });
  }
}

// -------------------------------------
// 🧠 Role Authorization
// -------------------------------------
function requireRole(roles = []) {
  // dukung 1 role string, atau array
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Akses ditolak. User tidak terautentikasi." });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Akses ditolak. Anda tidak memiliki hak untuk tindakan ini.",
        });
      }

      next();
    } catch (e) {
      console.error("❌ Role check error:", e);
      res.status(500).json({ message: "Kesalahan server saat verifikasi role." });
    }
  };
}

// -------------------------------------
// ✅ Ekspor Middleware
// -------------------------------------
module.exports = {
  authenticateToken,
  requireRole,
};
