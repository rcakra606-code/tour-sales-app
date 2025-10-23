// ==========================================================
// 👥 User Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import bcrypt from "bcryptjs";
import { pool } from "../server.js";

// ===== GET USERS =====
export async function getUsers(req, res) {
  try {
    const role = req.user.role;
    const staffName = req.user.staff_name;

    let query = `
      SELECT id, username, staff_name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    let params = [];

    if (role === "staff") {
      query = `
        SELECT id, username, staff_name, role, created_at
        FROM users
        WHERE staff_name = $1
      `;
      params = [staffName];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Get users error:", err);
    res.status(500).json({ message: "Gagal memuat data pengguna." });
  }
}

// ===== CREATE USER =====
export async function createUser(req, res) {
  try {
    const { username, password, staff_name, role } = req.body;
    if (!username || !password || !role)
      return res.status(400).json({ message: "Data tidak lengkap." });

    const checkUser = await pool.query(
      "SELECT username FROM users WHERE username = $1",
      [username]
    );
    if (checkUser.rows.length > 0)
      return res.status(400).json({ message: "Username sudah digunakan." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, password_hash, staff_name, role) VALUES ($1, $2, $3, $4)",
      [username, hashedPassword, staff_name || "", role]
    );

    res.json({ message: "User baru berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Create user error:", err);
    res.status(500).json({ message: "Gagal menambahkan user baru." });
  }
}

// ===== UPDATE USER =====
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { staff_name, password, role } = req.body;

    const existing = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan." });

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (staff_name) {
      updates.push(`staff_name = $${paramIndex++}`);
      params.push(staff_name);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramIndex++}`);
      params.push(hashedPassword);
    }

    if (role) {
      updates.push(`role = $${paramIndex++}`);
      params.push(role);
    }

    if (updates.length === 0)
      return res.status(400).json({ message: "Tidak ada data untuk diperbarui." });

    params.push(id);
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}`;
    await pool.query(query, params);

    res.json({ message: "Data user berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Update user error:", err);
    res.status(500).json({ message: "Gagal memperbarui data user." });
  }
}

// ===== DELETE USER =====
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete user error:", err);
    res.status(500).json({ message: "Gagal menghapus user." });
  }
}