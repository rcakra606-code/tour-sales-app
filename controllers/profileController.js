// ==========================================================
// 👤 Profile Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import bcrypt from "bcryptjs";
import { pool } from "../server.js";

// ===== GET PROFILE (fix untuk routes/profile.js) =====
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT id, username, staff_name, role, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan." });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ message: "Gagal memuat data profil." });
  }
}

// ===== UPDATE PROFILE (nama staff) =====
export async function updateProfile(req, res) {
  try {
    const { staff_name } = req.body;
    const userId = req.user.id;

    if (!staff_name)
      return res.status(400).json({ message: "Nama staff tidak boleh kosong." });

    await pool.query(
      "UPDATE users SET staff_name = $1 WHERE id = $2",
      [staff_name, userId]
    );

    res.json({ message: "Profil berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: "Gagal memperbarui profil." });
  }
}

// ===== UPDATE PASSWORD =====
export async function updatePassword(req, res) {
  try {
    const { old_password, new_password } = req.body;
    const userId = req.user.id;

    if (!old_password || !new_password)
      return res.status(400).json({ message: "Lengkapi semua field." });

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan." });

    const user = result.rows[0];
    const match = await bcrypt.compare(old_password, user.password_hash);
    if (!match)
      return res.status(401).json({ message: "Password lama salah." });

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newHash,
      userId,
    ]);

    res.json({ message: "Password berhasil diubah." });
  } catch (err) {
    console.error("❌ Update password error:", err);
    res.status(500).json({ message: "Gagal mengganti password." });
  }
}