// ==========================================================
// 🔐 Auth Controller — Travel Dashboard v5.3.9 (Render Safe)
// ==========================================================

import bcrypt from "bcryptjs"; // ✅ gunakan bcrypt dari bcryptjs
import jwt from "jsonwebtoken";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// ==========================================================
// 🔹 Generate JWT tokens
// ==========================================================
function generateTokens(user) {
  const accessToken = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      staff_name: user.staff_name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

// ==========================================================
// 🔹 POST /api/auth/login
// ==========================================================
export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi" });

    const q = `SELECT id, username, staff_name, role, password_hash FROM users WHERE username = $1 LIMIT 1;`;
    const { rows } = await pool.query(q, [username]);
    if (rows.length === 0)
      return res.status(401).json({ message: "User tidak ditemukan" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash); // ✅ gunakan bcrypt (bukan bcryptjs)
    if (!valid)
      return res.status(401).json({ message: "Password salah" });

    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      message: "Login berhasil",
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        staff_name: user.staff_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Auth login error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server saat login" });
  }
}

// ==========================================================
// 🔹 POST /api/auth/register
// ==========================================================
export async function register(req, res) {
  try {
    const { username, staff_name, password, role } = req.body;

    if (!username || !password || !role)
      return res.status(400).json({ message: "Data tidak lengkap" });

    const hashed = await bcrypt.hash(password, 10); // ✅ gunakan bcrypt
    const q = `
      INSERT INTO users (username, staff_name, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, staff_name, role;
    `;
    const values = [username, staff_name || username, hashed, role];
    const { rows } = await pool.query(q, values);

    res.status(201).json({
      message: "User berhasil dibuat",
      user: rows[0],
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: "Gagal membuat user baru" });
  }
}

// ==========================================================
// 🔹 POST /api/auth/refresh
// ==========================================================
export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token wajib diisi" });

    jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
      if (err)
        return res.status(401).json({ message: "Refresh token tidak valid" });

      const newAccessToken = jwt.sign(
        { id: decoded.id, username: decoded.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({ token: newAccessToken });
    });
  } catch (err) {
    console.error("❌ Refresh token error:", err);
    res.status(500).json({ message: "Gagal memperbarui token" });
  }
}

// ==========================================================
// 🔹 GET /api/auth/verify
// ==========================================================
export async function verify(req, res) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token)
      return res.status(401).json({ message: "Token tidak ditemukan" });

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, decoded });
  } catch (err) {
    console.error("❌ Verify token error:", err);
    res.status(401).json({ valid: false, message: "Token tidak valid atau kadaluarsa" });
  }
}