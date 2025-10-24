import db from "../config/database.js";
import bcrypt from "bcryptjs";

export async function getProfile(req, res){
  try{
    const userId = req.user?.id;
    const q = await db.query("SELECT id, username, staff_name, role, created_at FROM users WHERE id=$1", [userId]);
    res.json(q.rows[0] || null);
  }catch(err){
    console.error("GET profile error:", err);
    res.status(500).json({ message: "Gagal memuat profile" });
  }
}

export async function updateProfile(req, res){
  try{
    const userId = req.user?.id;
    const { staff_name } = req.body;
    await db.query("UPDATE users SET staff_name=$1 WHERE id=$2", [staff_name, userId]);
    res.json({ message: "Profil diperbarui" });
  }catch(err){
    console.error("UPDATE profile error:", err);
    res.status(500).json({ message: "Gagal memperbarui profile" });
  }
}

export async function changePassword(req, res){
  try{
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    const q = await db.query("SELECT password_hash FROM users WHERE id=$1", [userId]);
    if(q.rows.length===0) return res.status(404).json({ message: "User tidak ditemukan" });
    const hash = q.rows[0].password_hash;
    const ok = bcrypt.compareSync(currentPassword, hash);
    if(!ok) return res.status(400).json({ message: "Password lama salah" });
    const newHash = bcrypt.hashSync(newPassword, 10);
    await db.query("UPDATE users SET password_hash=$1 WHERE id=$2", [newHash, userId]);
    res.json({ message: "Password berhasil diubah" });
  }catch(err){
    console.error("CHANGE password error:", err);
    res.status(500).json({ message: "Gagal mengubah password" });
  }
}
