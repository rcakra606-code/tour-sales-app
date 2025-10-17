// controllers/usersController.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const { logger } = require("../config/logger");

const DEFAULT_RESET_PASSWORD = "ChangeMe123!";

function sanitizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email || null,
    role: u.role || "basic",
    type: u.type || u.role || "basic",
  };
}

exports.getAll = (req, res) => {
  try {
    const rows = db.prepare("SELECT id, name, username, email, role, type FROM users ORDER BY id DESC").all();
    res.json(rows);
  } catch (err) {
    logger?.error?.("users.getAll failed: " + err.message);
    res.status(500).json({ message: "Gagal mengambil daftar user" });
  }
};

exports.getMe = (req, res) => {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ message: "Unauthorized" });
    const row = db.prepare("SELECT id, name, username, email, role, type FROM users WHERE username = ?").get(username);
    res.json(sanitizeUser(row));
  } catch (err) {
    logger?.error?.("users.getMe failed: " + err.message);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

exports.create = (req, res) => {
  try {
    const { name, username, email, role, type, password } = req.body;
    if (!name || !username) return res.status(400).json({ message: "name dan username wajib" });

    const exists = db.prepare("SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)").get(username, email || null);
    if (exists) return res.status(409).json({ message: "Username atau email sudah terdaftar" });

    const pass = password && password.length >= 6 ? password : "ChangeMe123!";
    const hashed = bcrypt.hashSync(pass, 10);

    const stmt = db.prepare("INSERT INTO users (name, username, email, password, role, type) VALUES (?,?,?,?,?,?)");
    const info = stmt.run(name, username, email || null, hashed, role || "basic", type || role || "basic");

    const newUser = db.prepare("SELECT id, name, username, email, role, type FROM users WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({ message: "User dibuat", user: sanitizeUser(newUser), tempPassword: pass });
  } catch (err) {
    logger?.error?.("users.create failed: " + err.message);
    res.status(500).json({ message: "Gagal membuat user" });
  }
};

exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, type } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    db.prepare("UPDATE users SET name = ?, email = ?, role = ?, type = ? WHERE id = ?")
      .run(name || user.name, email || user.email, role || user.role, type || user.type, id);

    res.json({ message: "User diperbarui" });
  } catch (err) {
    logger?.error?.("users.update failed: " + err.message);
    res.status(500).json({ message: "Gagal memperbarui user" });
  }
};

exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ message: "User dihapus" });
  } catch (err) {
    logger?.error?.("users.delete failed: " + err.message);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
};

// Admin-only: reset password for a username
exports.resetPassword = (req, res) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ message: "username required" });

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // generate temporary password or use constant
    const temp = DEFAULT_RESET_PASSWORD;
    const hashed = bcrypt.hashSync(temp, 10);

    db.prepare("UPDATE users SET password = ? WHERE username = ?").run(hashed, username);
    logger?.info?.(`Password for ${username} reset by ${req.user?.username || "system"}`);

    // Return temp password to caller (admin). In production send via email instead.
    res.json({ message: "Password direset", tempPassword: temp });
  } catch (err) {
    logger?.error?.("users.resetPassword failed: " + err.message);
    res.status(500).json({ message: "Gagal mereset password" });
  }
};

// Change own password
exports.changePassword = (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: "oldPassword dan newPassword wajib" });
    const username = req.user?.username;
    if (!username) return res.status(401).json({ message: "Unauthorized" });

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const ok = bcrypt.compareSync(oldPassword, user.password);
    if (!ok) return res.status(401).json({ message: "Password lama salah" });

    const hashed = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE username = ?").run(hashed, username);

    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    logger?.error?.("users.changePassword failed: " + err.message);
    res.status(500).json({ message: "Gagal mengubah password" });
  }
};
