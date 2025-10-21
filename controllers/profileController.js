// ==========================================================
// 👤 Profile Controller — Travel Dashboard Enterprise v5.4.0
// ==========================================================
// User dapat:
//  - Melihat profilnya sendiri (GET /api/profile)
//  - Mengupdate nama staff & password (PUT /api/profile)
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
// 🔹 GET /api/profile — Ambil profil user aktif
// ==========================================================
export async function getProfile(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const q = `
      SELECT id, username, staff_name, role, created_at
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;
    const { rows } = await pool.query(q, [userId]);

    if (rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ getProfile error:", err);
    res.status(500).json({ message: "Gagal memuat profil user" });
  }
}

// ==========================================================
// 🔹 PUT /api/profile — Update profil user aktif
// ==========================================================
export async function updateProfile(req, res) {
  try {
    const userId = req.user?.id;
    const { staff_name, newPassword } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!staff_name && !newPassword)
      return res.status(400).json({ message: "Tidak ada data yang diubah" });

    // Ambil data lama
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE id = $1 LIMIT 1",
      [userId]
    );
    if (existingUser.rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan" });

    let passwordHash = existingUser.rows[0].password_hash;

    // Update password kalau diisi
    if (newPassword && newPassword.trim() !== "") {
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const q = `
      UPDATE users
      SET staff_name = COALESCE($1, staff_name),
          password_hash = $2
      WHERE id = $3
      RETURNING id, username, staff_name, role;
    `;
    const { rows } = await pool.query(q, [staff_name, passwordHash, userId]);

    res.json({
      message: "Profil berhasil diperbarui",
      user: rows[0],
    });
  } catch (err) {
    console.error("❌ updateProfile error:", err);
    res.status(500).json({ message: "Gagal memperbarui profil user" });
  }
}