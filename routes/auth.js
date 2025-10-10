// ================================
// ✅ AUTH ROUTES
// ================================
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ================================
// ✅ Dummy Admin User
// ================================
const ADMIN_USER = {
  username: 'admin',
  password: bcrypt.hashSync('admin123', 10), // password terenkripsi
  role: 'admin',
  name: 'Administrator'
};

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey123';

// ================================
// ✅ POST /api/auth/login
// ================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });

    // Cek username
    if (username !== ADMIN_USER.username)
      return res.status(401).json({ message: 'Username tidak ditemukan.' });

    // Cek password (compare bcrypt)
    const valid = await bcrypt.compare(password, ADMIN_USER.password);
    if (!valid)
      return res.status(401).json({ message: 'Password salah.' });

    // Buat token JWT
    const token = jwt.sign(
      { username: ADMIN_USER.username, role: ADMIN_USER.role },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    // Kirim data user + token
    return res.json({
      message: 'Login berhasil',
      token,
      username: ADMIN_USER.username,
      user: {
        name: ADMIN_USER.name,
        role: ADMIN_USER.role,
        username: ADMIN_USER.username
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// ================================
// ✅ GET /api/auth/profile
// ================================
router.get('/profile', authenticateToken, (req, res) => {
  try {
    res.json({
      user: {
        username: req.user.username,
        role: req.user.role,
        name: ADMIN_USER.name
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil profil pengguna.' });
  }
});

// ================================
// ✅ Middleware: Authenticate JWT
// ================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(401).json({ message: 'Token tidak ditemukan.' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ message: 'Token tidak valid.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err)
      return res.status(403).json({ message: 'Token kadaluarsa atau tidak valid.' });
    req.user = user;
    next();
  });
}

module.exports = router;
