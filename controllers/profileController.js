// ==========================================================
// 👤 Travel Dashboard Enterprise v5.3
// Profile Controller (View + Update Password Secure)
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

// 📄 Get Profile of Logged-in User
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User tidak terautentikasi" });

    const result = await pool.query(
      "SELECT id, username, staff_name, role, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Profil user tidak ditemukan" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ getProfile error:", err.message);
    res.status(500).json({ message: "Gagal memuat profil user" });
  }
};

// 🔐 Update Password
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!userId) return res.status(401).json({ message: "User tidak terautentikasi" });
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Password lama dan baru wajib diisi" });

    const userRes = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
    if (!userRes.rows.length)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const validPassword = await bcrypt.compare(oldPassword, userRes.rows[0].password);
    if (!validPassword)
      return res.status(400).json({ message: "Password lama tidak sesuai" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedNewPassword,
      userId,
    ]);

    res.json({ message: "✅ Password berhasil diperbarui" });
  } catch (err) {
    console.error("❌ updatePassword error:", err.message);
    res.status(500).json({ message: "Gagal memperbarui password" });
  }
};