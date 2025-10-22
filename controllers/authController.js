// ==========================================================
// 🔐 Auth Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Login user (JWT)
// - Verify token
// - Auto refresh role dan staff name
// ==========================================================

import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🧠 Helper: Generate JWT Token
// ==========================================================
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      staff_name: user.staff_name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}

// ==========================================================
// 🔹 POST /api/auth/login
// ==========================================================
export async function login(req, res) {
  const { username, password } = req.body;

  try {
    // 1️⃣ Cari user di database
    const userQuery = await pool.query(
      "SELECT id, username, password_hash, staff_name, role FROM users WHERE username = $1",
      [username]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    const user = userQuery.rows[0];

    // 2️⃣ Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    // 3️⃣ Buat JWT token
    const token = generateToken(user);

    // 4️⃣ Kirim response ke frontend
    res.json({
      token,
      username: user.username,
      staff_name: user.staff_name,
      role: user.role,
    });
  } catch (err) {
    console.error("❌ Auth login error:", err);
    res.status(500).json({ message: "Terjadi kesalahan saat login." });
  }
}

// ==========================================================
// 🔹 GET /api/auth/verify
// ==========================================================
export async function verifyToken(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Token tidak ditemukan." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userCheck = await pool.query(
      "SELECT id, username, role, staff_name FROM users WHERE id = $1",
      [decoded.id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(401).json({ message: "User tidak ditemukan." });
    }

    res.json({
      valid: true,
      user: userCheck.rows[0],
    });
  } catch (err) {
    console.error("❌ Verify token error:", err);
    res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
  }
}

// ==========================================================
// 🔹 POST /api/auth/register (Opsional: admin only)
// ==========================================================
export async function register(req, res) {
  try {
    const { username, password, role = "staff", staff_name } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi." });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, password_hash, role, staff_name) VALUES ($1, $2, $3, $4)",
      [username, hash, role, staff_name || ""]
    );

    res.json({ message: "User berhasil didaftarkan." });
  } catch (err) {
    console.error("❌ Register user error:", err);
    if (err.code === "23505") {
      return res.status(400).json({ message: "Username sudah digunakan." });
    }
    res.status(500).json({ message: "Gagal mendaftarkan user." });
  }
}