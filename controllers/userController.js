// ==========================================================
// 👥 User Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Get all users (admin / semiadmin only)
// - Create user (admin only)
// - Update user (admin / semiadmin)
// - Delete user (admin only)
// ==========================================================

import pkg from "pg";
import bcrypt from "bcryptjs";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/users — Ambil Semua User
// ==========================================================
export async function getUsers(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, username, staff_name, role, created_at
       FROM users ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Get users error:", err);
    res.status(500).json({ message: "Gagal memuat data user." });
  }
}

// ==========================================================
// 🔹 POST /api/users — Tambah User Baru (Admin)
// ==========================================================
export async function createUser(req, res) {
  try {
    const { username, password, staff_name, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi." });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan." });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, password_hash, staff_name, role)
       VALUES ($1, $2, $3, $4)`,
      [username, hash, staff_name || "", role || "staff"]
    );

    res.json({ message: "User berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Create user error:", err);
    res.status(500).json({ message: "Gagal menambahkan user." });
  }
}

// ==========================================================
// 🔹 PUT /api/users/:id — Update Data User
// ==========================================================
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { username, password, staff_name, role } = req.body;

    const existingUser = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    let query, values;

    if (password && password.trim() !== "") {
      const hash = await bcrypt.hash(password, 10);
      query = `
        UPDATE users SET username=$1, password_hash=$2, staff_name=$3, role=$4 WHERE id=$5
      `;
      values = [username, hash, staff_name, role, id];
    } else {
      query = `
        UPDATE users SET username=$1, staff_name=$2, role=$3 WHERE id=$4
      `;
      values = [username, staff_name, role, id];
    }

    await pool.query(query, values);

    res.json({ message: "Data user berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Update user error:", err);
    res.status(500).json({ message: "Gagal memperbarui data user." });
  }
}

// ==========================================================
// 🔹 DELETE /api/users/:id — Hapus User (Admin)
// ==========================================================
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    res.json({ message: "User berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete user error:", err);
    res.status(500).json({ message: "Gagal menghapus user." });
  }
}