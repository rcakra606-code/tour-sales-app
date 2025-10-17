// controllers/authController.js — Travel Dashboard Enterprise v2.0
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Temporary in-memory refresh tokens (you can store in db if needed)
let refreshTokens = [];

// ===========================================================
// 🧠 Helper: Generate Tokens
// ===========================================================
function generateAccessToken(user) {
  return jwt.sign(
    {
      username: user.username,
      name: user.name,
      email: user.email,
      type: user.type,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  refreshTokens.push(token);
  return token;
}

function cleanupExpiredTokens() {
  const now = Math.floor(Date.now() / 1000);
  refreshTokens = refreshTokens.filter((t) => {
    try {
      const decoded = jwt.verify(t, JWT_SECRET);
      return decoded.exp > now;
    } catch {
      return false;
    }
  });
}

// ===========================================================
// 🔐 LOGIN
// ===========================================================
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

    // Reset failed attempts if success
    db.prepare("UPDATE users SET failed_attempts = 0 WHERE username = ?").run(username);

    const payload = {
      username: user.username,
      name: user.name,
      email: user.email,
      type: user.type,
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ ok: true, token: accessToken, refreshToken, user: payload });
  } catch (err) {
    console.error("Auth login error:", err.message);
    res.status(500).json({ error: "Gagal memproses login." });
  }
};

// ===========================================================
// 🧾 REGISTER (admin only, optional if needed)
// ===========================================================
exports.register = (req, res) => {
  try {
    const { username, password, name, email, type } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username dan password wajib diisi." });

    const exists = db.prepare("SELECT username FROM users WHERE username = ?").get(username);
    if (exists)
      return res.status(400).json({ error: "Username sudah terdaftar." });

    const hash = bcrypt.hashSync(password, 8);
    db.prepare("INSERT INTO users (username, password, name, email, type) VALUES (?,?,?,?,?)")
      .run(username, hash, name || username, email || "", type || "basic");

    res.json({ ok: true, message: "User berhasil dibuat." });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Gagal menambah user." });
  }
};

// ===========================================================
// 🔄 REFRESH TOKEN
// ===========================================================
exports.refreshToken = (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ error: "Refresh token tidak ditemukan." });
    if (!refreshTokens.includes(token))
      return res.status(403).json({ error: "Refresh token tidak valid." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: "Refresh token kedaluwarsa." });

      const dbUser = db.prepare("SELECT * FROM users WHERE username = ?").get(user.username);
      if (!dbUser) return res.status(404).json({ error: "User tidak ditemukan." });

      const newAccessToken = generateAccessToken(dbUser);
      res.json({ ok: true, token: newAccessToken });
    });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    res.status(500).json({ error: "Gagal memperbarui token." });
  }
};

// ===========================================================
// 🚪 LOGOUT
// ===========================================================
exports.logout = (req, res) => {
  try {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter((t) => t !== token);
    res.json({ ok: true, message: "Logout berhasil." });
  } catch (err) {
    console.error("Logout error:", err.message);
    res.status(500).json({ error: "Gagal logout." });
  }
};

// ===========================================================
// 🧩 VERIFY TOKEN
// ===========================================================
exports.verify = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "Token tidak ditemukan." });
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ ok: true, user: decoded });
  } catch {
    res.status(403).json({ error: "Token tidak valid atau kedaluwarsa." });
  }
};
