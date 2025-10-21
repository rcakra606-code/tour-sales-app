// ==========================================================
// 👥 User Controller — Travel Dashboard Enterprise v5.4.0
// ==========================================================
// Fully compatible with Render + NeonDB + Node.js 22 (ESM)
// ==========================================================

import bcryptjs from "bcryptjs";
const bcrypt = bcryptjs;
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/users — List semua user (Admin & SemiAdmin)
// ==========================================================
export async function getUsers(req, res) {
  try {
    const q = `
      SELECT id, username, staff_name, role, created_at
      FROM users
      ORDER BY id ASC;
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ getUsers error:", err);
    res.status(500).json({ message: "Gagal memuat data user" });
  }
}

// ==========================================================
// 🔹 GET /api/users/:id — Detail user tertentu
// ==========================================================
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const q = `
      SELECT id, username, staff_name, role, created_at
      FROM users
      WHERE id = $1;
    `;
    const { rows } = await pool.query(q, [id]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ getUserById error:", err);
    res.status(500).json({ message: "Gagal memuat data user" });
  }
}

// ==========================================================
// 🔹 POST /api/users — Tambah user baru
// ==========================================================
export async function createUser(req, res) {
  try {
    const { username, staff_name, password, role } = req.body;

    if (!username || !password || !role)
      return res.status(400).json({ message: "Data tidak lengkap" });

    const hashed = await bcrypt.hash(password, 10);
    const q = `
      INSERT INTO users (username, staff_name, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, staff_name, role;
    `;
    const { rows } = await pool.query(q, [
      username,
      staff_name || username,
      hashed,
      role,
    ]);

    res.status(201).json({
      message: "User berhasil dibuat",
      user: rows[0],
    });
  } catch (err) {
    console.error("❌ createUser error:", err);
    if (err.code === "23505") {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }
    res.status(500).json({ message: "Gagal membuat user baru" });
  }
}

// ==========================================================
// 🔹 PUT /api/users/:id — Update user
// ==========================================================
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { staff_name, password, role } = req.body;

    const userOld = await pool.query(
      "SELECT * FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    if (userOld.rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    let passwordHash = userOld.rows[0].password_hash;
    if (password && password.trim() !== "") {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const q = `
      UPDATE users
      SET staff_name = $1, password_hash = $2, role = $3
      WHERE id = $4
      RETURNING id, username, staff_name, role;
    `;
    const values = [staff_name, passwordHash, role, id];
    const { rows } = await pool.query(q, values);

    res.json({
      message: "User berhasil diperbarui",
      user: rows[0],
    });
  } catch (err) {
    console.error("❌ updateUser error:", err);
    res.status(500).json({ message: "Gagal memperbarui user" });
  }
}

// ==========================================================
// 🔹 DELETE /api/users/:id — Hapus user
// ==========================================================
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM users WHERE id = $1;", [id]);

    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteUser error:", err);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
}