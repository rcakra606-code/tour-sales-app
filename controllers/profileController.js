// ==========================================================
// 👤 Profile Controller — Travel Dashboard Enterprise v5.5
// ==========================================================

import bcrypt from "bcryptjs";
import { pool } from "../server.js";

// ===== GET PROFILE (data user yang sedang login) =====
export async function getProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Token tidak valid atau kadaluarsa." });

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

// ===== UPDATE PROFILE (nama staff atau password) =====
export async function updateProfile(req, res) {
  try {
    const userId = req.user?.id;
    const { staff_name, password } = req.body;

    if (!userId)
      return res.status(401).json({ message: "Token tidak valid atau kadaluarsa." });

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

    if (updates.length === 0)
      return res.status(400).json({ message: "Tidak ada data yang diperbarui." });

    params.push(userId);

    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
      params
    );

    res.json({ message: "Profil berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: "Gagal memperbarui profil." });
  }
}