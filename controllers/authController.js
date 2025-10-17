// controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refreshsecretkey987";

// Simpan refresh token di tabel baru
db.prepare(`
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    token TEXT,
    created_at TEXT
  )
`).run();

function createAccessToken(user) {
  return jwt.sign(
    { username: user.username, type: user.type },
    JWT_SECRET,
    { expiresIn: "15m" } // 15 menit aktif
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { username: user.username },
    REFRESH_SECRET,
    { expiresIn: "7d" } // Refresh valid 7 hari
  );
}

// === LOGIN ===
exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username dan password wajib diisi." });

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) return res.status(401).json({ error: "User tidak ditemukan." });
  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: "Password salah." });

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  db.prepare("INSERT INTO refresh_tokens (username, token, created_at) VALUES (?,?,?)")
    .run(username, refreshToken, new Date().toISOString());

  res.json({
    token: accessToken,
    refreshToken,
    user: { username, name: user.name, email: user.email, type: user.type },
  });
};

// === VERIFY TOKEN ===
exports.verifyToken = (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ valid: false });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
};

// === REFRESH TOKEN ===
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token dibutuhkan" });

  const found = db.prepare("SELECT * FROM refresh_tokens WHERE token = ?").get(refreshToken);
  if (!found) return res.status(403).json({ error: "Token tidak valid" });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(decoded.username);
    if (!user) return res.status(403).json({ error: "User tidak valid" });

    const newAccess = createAccessToken(user);
    res.json({ token: newAccess });
  } catch (err) {
    db.prepare("DELETE FROM refresh_tokens WHERE token = ?").run(refreshToken);
    res.status(403).json({ error: "Refresh token kadaluarsa" });
  }
};

// === LOGOUT ===
exports.logout = (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    db.prepare("DELETE FROM refresh_tokens WHERE token = ?").run(refreshToken);
  }
  res.json({ ok: true });
};
