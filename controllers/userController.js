// controllers/usersController.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");

exports.getAllUsers = (req, res) => {
  try {
    const rows = db.prepare("SELECT id, name, username, email, role, type FROM users ORDER BY id DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = (req, res) => {
  try {
    const { name, username, email, password, role, type } = req.body;
    if (!name || !username || !password) return res.status(400).json({ message: "Name, username, and password required" });

    const exists = db.prepare("SELECT id FROM users WHERE username = ? OR email = ?").get(username, email || null);
    if (exists) return res.status(409).json({ message: "User already exists" });

    const hashed = bcrypt.hashSync(password, 10);
    db.prepare(`
      INSERT INTO users (name, username, email, password, role, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, username, email || null, hashed, role || type || "basic", type || role || "basic");

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, email, role, type, password } = req.body;

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let hashed = user.password;
    if (password) hashed = bcrypt.hashSync(password, 10);

    db.prepare(`
      UPDATE users SET name=?, username=?, email=?, password=?, role=?, type=? WHERE id=?
    `).run(name || user.name, username || user.username, email || user.email, hashed, role || user.role, type || user.type, id);

    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;
    const del = db.prepare("DELETE FROM users WHERE id = ?").run(id);
    if (del.changes === 0) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
