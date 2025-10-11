// ===============================
// ✅ Auth Controller
// ===============================
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// Dummy users (nanti bisa diganti dengan database)
const users = [
  { id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 8), role: 'admin' },
  { id: 2, username: 'staff', password: bcrypt.hashSync('staff123', 8), role: 'staff' }
];

// ===============================
// ✅ Login
// ===============================
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });

    const user = users.find(u => u.username === username);
    if (!user)
      return res.status(401).json({ message: 'Username tidak ditemukan.' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Password salah.' });

    // ✅ Generate JWT token
    const token = generateToken({ id: user.id, username: user.username, role: user.role });

    res.json({
      message: 'Login berhasil',
      token,
      username: user.username,
      role: user.role
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// ===============================
// ✅ Protected Profile Route
// ===============================
exports.profile = (req, res) => {
  try {
    const { user } = req; // dari middleware/auth.js
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      message: 'Profil berhasil dimuat'
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ message: 'Gagal memuat profil pengguna.' });
  }
};

// ===============================
// ✅ Optional: Register (untuk testing / future use)
// ===============================
exports.register = (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });

    const exists = users.find(u => u.username === username);
    if (exists)
      return res.status(409).json({ message: 'Username sudah digunakan.' });

    const hashed = bcrypt.hashSync(password, 8);
    const newUser = {
      id: users.length + 1,
      username,
      password: hashed,
      role: role || 'staff'
    };

    users.push(newUser);
    res.json({ message: 'Registrasi berhasil', user: { username, role: newUser.role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Gagal registrasi pengguna.' });
  }
};
