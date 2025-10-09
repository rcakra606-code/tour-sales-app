// middleware/authMiddleware.js

// Middleware sederhana untuk validasi token login
module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Cek apakah ada header Authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ada." });
  }

  const token = authHeader.split(" ")[1];

  // Karena kita pakai fake token (tidak JWT), cukup validasi sederhana
  if (token !== "fake-jwt-token") {
    return res.status(403).json({ message: "Token tidak valid." });
  }

  // Simpan data user ke request agar bisa digunakan di route
  req.user = { username: "admin" };
  next();
};
