// controllers/authController.js — Final Production Version
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refreshsecretkey987";
const ACCESS_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || "15m";
const REFRESH_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || "7d";

/**
 * Membuat JWT Access Token
 */
function generateAccessToken(user) {
  return jwt.sign(
    { username: user.username, type: user.type },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRE }
  );
}

/**
 * Membuat JWT Refresh Token
 */
function generateRefreshToken(user) {
  const token = jwt.sign(
    { username: user.username },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRE }
  );
  // Simpan di DB
  db.prepare("INSERT INTO refresh_tokens (username, token) VALUES (?, ?)").run(user.username, token);
  return token;
}

/**
 * Membersihkan refresh token expired (opsional)
 */
function cleanupExpiredTokens() {
  try {
    db.prepare(`
      DELETE FROM refresh_tokens 
      WHERE datetime(created_at, '+8 days') < datetime('now')
    `).run();
  } catch {}
}

/**
 * LOGIN
 * POST /api/auth/login
 */
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username dan password wajib diisi." });

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) return res.status(401).json({ error: "User tidak ditemukan." });

    if (user.locked)
      return res.status(403).json({ error: "Akun terkunci. Hubungi admin untuk membuka kunci." });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      const newAttempts = (user.failed_attempts || 0) + 1;
      db.prepare("UPDATE users SET failed_attempts = ? WHERE username = ?").run(newAttempts, username);

      if (newAttempts >= 3) {
        db.prepare("UPDATE users SET locked = 1 WHERE username = ?").run(username);
        return res.status(403).json({ error: "Akun dikunci karena 3x gagal login." });
      }

      return res.status(401).json({ error: `Password salah (${newAttempts}/3).` });
    }

    // Reset counter jika sukses login
    db.prepare("UPDATE users SET failed_attempts = 0 WHERE username = ?").run(username);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    cleanupExpiredTokens();

    res.json({
      ok: true,
      token: accessToken,
      refreshToken,
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        type: user.type,
      },
    });
  } catch (err) {
    console.error("Auth login error:", err.message);
    res.status(500).json({ error: "Gagal memproses login." });
  }
};

/**
 * REFRESH TOKEN
 * POST /api/auth/refresh
 */
exports.refresh = (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: "Refresh token diperlukan." });

    const found = db.prepare("SELECT * FROM refresh_tokens WHERE token = ?").get(refreshToken);
    if (!found) return res.status(403).json({ error: "Refresh token tidak valid." });

    jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Refresh token kedaluwarsa." });

      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(decoded.username);
      if (!user) return res.status(404).json({ error: "User tidak ditemukan." });

      const newAccess = generateAccessToken(user);
      res.json({ token: newAccess });
    });
  } catch (err) {
    console.error("Auth refresh error:", err.message);
    res.status(500).json({ error: "Gagal memperbarui token." });
  }
};

/**
 * VERIFY TOKEN
 * GET /api/auth/verify
 */
exports.verify = (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ valid: false });

    const token = header.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ valid: false });
      res.json({ valid: true, user: decoded });
    });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
};

/**
 * LOGOUT
 * POST /api/auth/logout
 */
exports.logout = (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken)
      db.prepare("DELETE FROM refresh_tokens WHERE token = ?").run(refreshToken);
    res.json({ ok: true, message: "Logout berhasil." });
  } catch (err) {
    console.error("Auth logout error:", err.message);
    res.status(500).json({ error: "Gagal logout." });
  }
};
