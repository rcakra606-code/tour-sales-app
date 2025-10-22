import bcrypt from "bcryptjs";
import { pool } from "../server.js";

export async function updatePassword(req, res) {
  try {
    const { old_password, new_password } = req.body;
    const userId = req.user.id;

    if (!old_password || !new_password)
      return res.status(400).json({ message: "Lengkapi semua field." });

    const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User tidak ditemukan." });

    const user = result.rows[0];
    const match = await bcrypt.compare(old_password, user.password_hash);
    if (!match)
      return res.status(401).json({ message: "Password lama salah." });

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, userId]);

    res.json({ message: "Password berhasil diubah." });
  } catch (err) {
    console.error("❌ Update password error:", err);
    res.status(500).json({ message: "Gagal mengganti password." });
  }
}