/**
 * ==========================================================
 * controllers/authController.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Login dengan JWT
 * ✅ Password terenkripsi (bcrypt)
 * ✅ Verifikasi token aktif
 * ✅ Refresh token opsional
 * ✅ Logout user
 * ✅ Kompatibel Neon & SQLite
 * ==========================================================
 */

const db = require("../config/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const logger = require("../config/logger");

// JWT secret & expiration
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// ============================================================
// 🔑 POST /api/auth/login
// ============================================================
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi" });

    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (!user) {
      logger.warn(`🚫 Login gagal: username tidak ditemukan (${username})`);
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`🚫 Login gagal: password salah (${username})`);
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });

    logger.info(`✅ Login berhasil untuk ${username} (${user.role})`);
    res.json({
      message: "Login berhasil",
      token,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    logger.error("❌ Error during login:", err);
    res.status(500).json({ message: "Gagal memproses login" });
  }
};

// ============================================================
// 🧾 GET /api/auth/verify
// ============================================================
exports.verifyUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Token tidak valid" });

    const dbUser = await db.get("SELECT id, username, role FROM users WHERE id = ?", [user.id]);
    if (!dbUser) return res.status(404).json({ message: "User tidak ditemukan" });

    res.json({
      message: "Token valid",
      user: dbUser,
    });
  } catch (err) {
    logger.error("❌ Error verifying token:", err);
    res.status(500).json({ message: "Gagal memverifikasi user" });
  }
};

// ============================================================
// 🔁 POST /api/auth/refresh
// ============================================================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token wajib disertakan" });

    jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Refresh token tidak valid" });

      const newToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        message: "Token baru berhasil dibuat",
        token: newToken,
      });
    });
  } catch (err) {
    logger.error("❌ Error refreshing token:", err);
    res.status(500).json({ message: "Gagal memperbarui token" });
  }
};

// ============================================================
// 🚪 POST /api/auth/logout
// ============================================================
exports.logoutUser = async (req, res) => {
  try {
    // Token dikelola di sisi client (hapus dari localStorage)
    res.json({ message: "Logout berhasil, token dihapus dari sisi client" });
  } catch (err) {
    logger.error("❌ Error during logout:", err);
    res.status(500).json({ message: "Gagal logout user" });
  }
};
