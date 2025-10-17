// controllers/userController.js
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/**
 * Ambil daftar user (search + pagination)
 */
exports.getAllUsers = (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const totalRow = db
      .prepare(
        `SELECT COUNT(*) AS c FROM users 
         WHERE username LIKE ? OR name LIKE ? OR email LIKE ?`
      )
      .get(search, search, search);
    const total = totalRow.c || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const users = db
      .prepare(
        `SELECT username, name, email, type 
         FROM users 
         WHERE username LIKE ? OR name LIKE ? OR email LIKE ? 
         ORDER BY username ASC 
         LIMIT ? OFFSET ?`
      )
      .all(search, search, search, limit, offset);

    res.json({ data: users, total, page, totalPages });
  } catch (err) {
    console.error("Error getAllUsers:", err.message);
    res.status(500).json({ error: "Gagal mengambil data user." });
  }
};

/**
 * Tambah user baru
 */
exports.createUser = (req, res) => {
  try {
    const { username, password, name, email, type } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username dan password wajib diisi." });

    if (password.length < 6)
      return res.status(400).json({ error: "Password minimal 6 karakter." });

    const exists = db.prepare("SELECT username FROM users WHERE username = ?").get(username);
    if (exists) return res.status(400).json({ error: "Username sudah digunakan." });

    const hashed = bcrypt.hashSync(password, 8);
    db.prepare(
      "INSERT INTO users (username,password,name,email,type) VALUES (?,?,?,?,?)"
    ).run(username, hashed, name || username, email || "", type || "basic");

    res.json({ ok: true, message: "User berhasil ditambahkan." });
  } catch (err) {
    console.error("Error createUser:", err.message);
    res.status(500).json({ error: "Gagal menambah user." });
  }
};

/**
 * Update user (nama, email, role, password opsional)
 */
exports.updateUser = (req, res) => {
  try {
    const { username, name, email, type, password } = req.body;
    if (!username)
      return res.status(400).json({ error: "Username wajib diisi." });

    const exists = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!exists) return res.status(404).json({ error: "User tidak ditemukan." });

    if (password && password.trim() !== "") {
      if (password.length < 6)
        return res.status(400).json({ error: "Password minimal 6 karakter." });
      const hashed = bcrypt.hashSync(password, 8);
      db.prepare(
        "UPDATE users SET password=?, name=?, email=?, type=? WHERE username=?"
      ).run(hashed, name || exists.name, email || exists.email, type || exists.type, username);
    } else {
      db.prepare("UPDATE users SET name=?, email=?, type=? WHERE username=?")
        .run(name || exists.name, email || exists.email, type || exists.type, username);
    }

    res.json({ ok: true, message: "User berhasil diperbarui." });
  } catch (err) {
    console.error("Error updateUser:", err.message);
    res.status(500).json({ error: "Gagal memperbarui user." });
  }
};

/**
 * Hapus user
 */
exports.deleteUser = (req, res) => {
  try {
    const { username } = req.params;
    if (username === "admin")
      return res.status(400).json({ error: "User admin utama tidak bisa dihapus." });

    const exists = db.prepare("SELECT username FROM users WHERE username = ?").get(username);
    if (!exists) return res.status(404).json({ error: "User tidak ditemukan." });

    db.prepare("DELETE FROM users WHERE username = ?").run(username);
    res.json({ ok: true, message: "User berhasil dihapus." });
  } catch (err) {
    console.error("Error deleteUser:", err.message);
    res.status(500).json({ error: "Gagal menghapus user." });
  }
};

/**
 * Ganti password sendiri (user login)
 * Body: { oldPassword, newPassword }
 */
exports.changePassword = (req, res) => {
  try {
    const username = req.user?.username;
    if (!username) return res.status(401).json({ error: "Unauthorized" });

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ error: "Password lama dan baru wajib diisi." });

    if (newPassword.length < 6)
      return res.status(400).json({ error: "Password minimal 6 karakter." });

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan." });

    const valid = bcrypt.compareSync(oldPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Password lama salah." });

    const hashed = bcrypt.hashSync(newPassword, 8);
    db.prepare("UPDATE users SET password = ? WHERE username = ?").run(hashed, username);
    res.json({ ok: true, message: "Password berhasil diubah." });
  } catch (err) {
    console.error("Error changePassword:", err.message);
    res.status(500).json({ error: "Gagal mengubah password." });
  }
};
