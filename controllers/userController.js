// controllers/userController.js
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

// Koneksi ke database SQLite
const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/**
 * GET /api/users
 * Mendapatkan daftar user dengan pagination dan pencarian
 * Query params:
 * - search (opsional)
 * - page (opsional, default 1)
 * - limit (opsional, default 10)
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

    res.json({
      data: users,
      total,
      page,
      totalPages,
    });
  } catch (err) {
    console.error("Error getAllUsers:", err.message);
    res.status(500).json({ error: "Gagal mengambil data user." });
  }
};

/**
 * POST /api/users
 * Menambahkan user baru (hanya untuk admin)
 * Body: { username, password, name, email, type }
 */
exports.createUser = (req, res) => {
  try {
    const { username, password, name, email, type } = req.body;
    if (!username || !password)
      return res
        .status(400)
        .json({ error: "Username dan password wajib diisi." });

    const exists = db
      .prepare("SELECT username FROM users WHERE username = ?")
      .get(username);
    if (exists)
      return res.status(400).json({ error: "Username sudah digunakan." });

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
 * PUT /api/users
 * Mengupdate user (nama, email, type, atau password)
 * Body: { username, name, email, type, password? }
 */
exports.updateUser = (req, res) => {
  try {
    const { username, name, email, type, password } = req.body;
    if (!username)
      return res.status(400).json({ error: "Username wajib diisi." });

    const exists = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);
    if (!exists) return res.status(404).json({ error: "User tidak ditemukan." });

    if (password && password.trim() !== "") {
      const hashed = bcrypt.hashSync(password, 8);
      db.prepare(
        "UPDATE users SET password=?, name=?, email=?, type=? WHERE username=?"
      ).run(hashed, name || exists.name, email || exists.email, type || exists.type, username);
    } else {
      db.prepare("UPDATE users SET name=?, email=?, type=? WHERE username=?").run(
        name || exists.name,
        email || exists.email,
        type || exists.type,
        username
      );
    }

    res.json({ ok: true, message: "User berhasil diperbarui." });
  } catch (err) {
    console.error("Error updateUser:", err.message);
    res.status(500).json({ error: "Gagal memperbarui user." });
  }
};

/**
 * DELETE /api/users/:username
 * Menghapus user berdasarkan username
 */
exports.deleteUser = (req, res) => {
  try {
    const { username } = req.params;
    if (!username)
      return res.status(400).json({ error: "Username tidak diberikan." });

    if (username === "admin")
      return res
        .status(400)
        .json({ error: "User admin utama tidak bisa dihapus." });

    const exists = db
      .prepare("SELECT username FROM users WHERE username = ?")
      .get(username);
    if (!exists) return res.status(404).json({ error: "User tidak ditemukan." });

    db.prepare("DELETE FROM users WHERE username = ?").run(username);
    res.json({ ok: true, message: "User berhasil dihapus." });
  } catch (err) {
    console.error("Error deleteUser:", err.message);
    res.status(500).json({ error: "Gagal menghapus user." });
  }
};

/**
 * GET /api/users/:username
 * Mengambil data user spesifik (opsional jika ingin diakses dari UI)
 */
exports.getUserByUsername = (req, res) => {
  try {
    const { username } = req.params;
    if (!username)
      return res.status(400).json({ error: "Username tidak diberikan." });

    const user = db
      .prepare("SELECT username, name, email, type FROM users WHERE username = ?")
      .get(username);

    if (!user) return res.status(404).json({ error: "User tidak ditemukan." });
    res.json(user);
  } catch (err) {
    console.error("Error getUserByUsername:", err.message);
    res.status(500).json({ error: "Gagal mengambil data user." });
  }
};
