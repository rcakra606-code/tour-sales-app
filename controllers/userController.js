// controllers/userController.js
const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

exports.getAllUsers = (req, res) => {
  const users = db.prepare("SELECT username, name, email, type FROM users ORDER BY username ASC").all();
  res.json(users);
};

exports.createUser = (req, res) => {
  const { username, password, name, email, type } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username dan password wajib diisi." });

  const exists = db.prepare("SELECT 1 FROM users WHERE username = ?").get(username);
  if (exists) return res.status(400).json({ error: "Username sudah terdaftar." });

  const hashed = bcrypt.hashSync(password, 8);
  db.prepare("INSERT INTO users (username,password,name,email,type) VALUES (?,?,?,?,?)")
    .run(username, hashed, name || username, email || "", type || "basic");

  res.json({ ok: true });
};

exports.updateUser = (req, res) => {
  const { username, name, email, type, password } = req.body;
  const exists = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!exists) return res.status(404).json({ error: "User tidak ditemukan." });

  if (password) {
    const hashed = bcrypt.hashSync(password, 8);
    db.prepare("UPDATE users SET password=?, name=?, email=?, type=? WHERE username=?")
      .run(hashed, name, email, type, username);
  } else {
    db.prepare("UPDATE users SET name=?, email=?, type=? WHERE username=?")
      .run(name, email, type, username);
  }

  res.json({ ok: true });
};

exports.deleteUser = (req, res) => {
  const { username } = req.params;
  if (username === "admin") return res.status(400).json({ error: "User admin utama tidak bisa dihapus." });
  db.prepare("DELETE FROM users WHERE username = ?").run(username);
  res.json({ ok: true });
};
