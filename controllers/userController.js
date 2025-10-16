// controllers/usersController.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");

/**
 * Ambil semua user (khusus admin/super)
 */
exports.getAllUsers = (req, res) => {
  try {
    const users = db
      .prepare("SELECT id, name, username, email, role, type FROM users ORDER BY id ASC")
      .all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Ganti password oleh user sendiri
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Data tidak lengkap" });

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ message: "Password lama salah" });

    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, req.user.id);

    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Reset password oleh admin/super
 */
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword)
      return res.status(400).json({ message: "Password baru wajib diisi" });

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, id);

    res.json({ message: "Password user berhasil direset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tambah user baru (oleh admin/super)
 */
exports.createUser = async (req, res) => {
  try {
    const { name, username, email, password, role, type } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ message: "Nama, username, dan password wajib diisi" });

    const exists = db
      .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
      .get(username, email || null);
    if (exists) return res.status(409).json({ message: "Username atau email sudah terdaftar" });

    const hashed = await bcrypt.hash(password, 10);
    db.prepare(`
      INSERT INTO users (name, username, email, password, role, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, username, email || null, hashed, role || "basic", type || "basic");

    res.status(201).json({ message: "User berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Hapus user (oleh admin/super)
 */
exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
