const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const Database = require('better-sqlite3');

// Inisialisasi SQLite
const db = new Database(path.join(__dirname, '../data/app.db'));

// Pastikan tabel user ada
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'staff'
  )
`).run();

// ================================
// ✅ REGISTER USER (Admin setup)
// ================================
exports.registerUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });

    const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existing) return res.status(400).json({ message: 'Username sudah digunakan.' });

    const hashed = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(
      username,
      hashed,
      role || 'staff'
    );

    res.status(201).json({ success: true, message: 'User berhasil didaftarkan.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// ================================
// ✅ LOGIN USER
// ================================
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username dan password wajib diisi.' });

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return res.status(401).json({ message: 'Username tidak ditemukan.' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Password salah.' });

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// ================================
// ✅ PROFILE USER (Validasi Token)
// ================================
exports.getProfile = (req, res) => {
  try {
    const { user } = req;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memuat profil' });
  }
};
