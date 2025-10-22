// ==========================================================
// 👤 Profile Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Ambil profil user yang sedang login
// - Update nama staff
// - Ganti password (dengan validasi password lama)
// ==========================================================

import pkg from "pg";
import bcrypt from "bcryptjs";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/profile — Ambil data user login
// ==========================================================
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT id, username, staff_name, role FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ message: "Gagal memuat profil." });
  }
}

// ==========================================================
// 🔹 PUT /api/profile — Update nama staff
// ==========================================================
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { staff_name } = req.body;

    if (!staff_name || staff_name.trim() === "") {
      return res.status(400).json({ message: "Nama staff tidak boleh kosong." });
    }

    await pool.query("UPDATE users SET staff_name = $1 WHERE id = $2", [
      staff_name,
      userId,
    ]);

    res.json({ message: "Profil berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: "Gagal memperbarui profil." });
  }
}

// ==========================================================
// 🔹 PUT /api/profile/password — Ganti Password
// ==========================================================
export async function updatePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Password lama salah." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newHash,
      userId,
    ]);

    res.json({ message: "Password berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Update password error:", err);
    res.status(500).json({ message: "Gagal memperbarui password." });
  }
}