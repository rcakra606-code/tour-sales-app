// ==========================================================
// 👥 Travel Dashboard Enterprise v5.3
// User Controller (CRUD + Secure + Bcrypt + PostgreSQL)
// ==========================================================
import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 📋 Get All Users (Admin Only)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, staff_name, role, created_at FROM users ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ getAllUsers error:", err.message);
    res.status(500).json({ message: "Gagal memuat data user" });
  }
};

// ➕ Create New User
export const createUser = async (req, res) => {
  try {
    const { username, staffName, password, role } = req.body;

    if (!username || !password || !role)
      return res.status(400).json({ message: "Username, password, dan role wajib diisi" });

    const existing = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "Username sudah digunakan" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, staff_name, password, role) VALUES ($1, $2, $3, $4)",
      [username, staffName || null, hashedPassword, role]
    );

    res.status(201).json({ message: "✅ User berhasil ditambahkan" });
  } catch (err) {
    console.error("❌ createUser error:", err.message);
    res.status(500).json({ message: "Gagal menambahkan user" });
  }
};

// ❌ Delete User (Admin Only)
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    const check = await pool.query("SELECT id FROM users WHERE id = $1", [id]);
    if (check.rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "✅ User berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteUser error:", err.message);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
};