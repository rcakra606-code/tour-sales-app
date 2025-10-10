// =====================================
// ✅ AUTH MIDDLEWARE (JWT Verifier)
// =====================================
const jwt = require('jsonwebtoken');

// Gunakan secret dari .env atau fallback
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// ===========================
// 🔹 Middleware autentikasi
// ===========================
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan. Silakan login kembali.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }

    // Simpan user di req.user agar bisa digunakan di controller
    req.user = user;
    next();
  });
};

// ===========================
// 🔹 Helper: Membuat token baru
// ===========================
exports.generateToken = (userData) => {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '12h' }); // berlaku 12 jam
};
