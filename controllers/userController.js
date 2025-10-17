// controllers/userController.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");

// 🔹 Ambil semua user
exports.getAll = (req, res) => {
  try {
    const users = db.prepare("SELECT id, name, username, email, type FROM users ORDER BY id DESC").all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Ambil user berdasarkan ID
exports.getById = (req, res) => {
  try {
    const user = db.prepare("SELECT id, name, username, email, type FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Tambah user (admin)
exports.create = (req, res) => {
  try {
    const { name, username, email, password, type } = req.body;
    if (!name || !username || !password) return res.status(400).json({ message: "Field wajib belum lengkap" });

    const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (exists) return res.status(409).json({ message: "Username sudah digunakan" });

    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare("INSERT INTO users (name, username, email, password, type) VALUES (?, ?, ?, ?, ?)");
    stmt.run(name, username, email || null, hash, type || "basic");

    res.status(201).json({ message: "User berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Update data user (admin)
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, type } = req.body;

    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    db.prepare("UPDATE users SET name = ?, email = ?, type = ? WHERE id = ?").run(name, email, type, id);
    res.json({ message: "User diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Hapus user (admin)
exports.remove = (req, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ message: "User dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 User ganti password sendiri
exports.changePassword = (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const valid = bcrypt.compareSync(oldPassword, user.password);
    if (!valid) return res.status(401).json({ message: "Password lama salah" });

    const hash = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hash, userId);

    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Admin reset password user lain
exports.resetPassword = (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const hash = bcrypt.hashSync(newPassword || "password123", 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hash, id);

    res.json({ message: `Password user '${user.username}' berhasil direset` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
