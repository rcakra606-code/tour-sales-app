// =====================================
// ✅ middleware/authMiddleware.js (FINAL - JWT Compatible)
// =====================================
const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verifikasi token dengan secret yang sama dari controller
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded; // Simpan data user di req
    next();
  } catch (err) {
    console.warn("⚠️ Token invalid:", err.message);
    return res.status(403).json({ message: "Token tidak valid atau kadaluarsa." });
  }
};
