// ==========================================================
// 👤 Profile Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Lihat profil user login
// - Update data user (username, nama staff, password)
// - Aman dengan bcryptjs & PostgreSQL SSL
// ==========================================================

import pkg from "pg";
import bcryptjs from "bcryptjs";

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/profile — Ambil Data Profil User
// ==========================================================
export async function getProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User tidak ditemukan atau belum login." });
    }

    const query = `
      SELECT id, username, staff_name, role
      FROM users
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Data profil tidak ditemukan." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil profil." });
  }
}

// ==========================================================
// 🔹 PUT /api/profile — Update Profil User
// ==========================================================
export async function updateProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User tidak ditemukan atau belum login." });
    }

    const { username, staff_name, password } = req.body;

    if (!username && !staff_name && !password) {
      return res.status(400).json({ message: "Tidak ada data yang diperbarui." });
    }

    let updateFields = [];
    let updateValues = [];
    let paramIndex = 1;

    if (username) {
      updateFields.push(`username = $${paramIndex++}`);
      updateValues.push(username);
    }

    if (staff_name) {
      updateFields.push(`staff_name = $${paramIndex++}`);
      updateValues.push(staff_name);
    }

    if (password) {
      const hashedPassword = await bcryptjs.hash(password, 10);
      updateFields.push(`password_hash = $${paramIndex++}`);
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "Tidak ada data untuk diubah." });
    }

    const query = `
      UPDATE users
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, username, staff_name, role;
    `;
    updateValues.push(userId);

    const { rows } = await pool.query(query, updateValues);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    res.json({
      message: "Profil berhasil diperbarui.",
      user: rows[0],
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: "Gagal memperbarui profil." });
  }
}