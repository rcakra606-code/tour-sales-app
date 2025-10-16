// controllers/usersController.js
const db = require("../config/database");
const bcrypt = require("bcrypt");

// ✅ Get all users (admin only)
exports.getAllUsers = (req, res) => {
  try {
    const users = db.prepare("SELECT id, username, role FROM users").all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ User change password (send old + new)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Data tidak lengkap" });

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ message: "Password lama salah" });

    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, req.user.id);

    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Admin reset password user lain
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ message: "Password baru wajib diisi" });

    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, id);

    res.json({ message: "Password user berhasil direset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
