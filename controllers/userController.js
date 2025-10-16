// controllers/usersController.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");

exports.getAllUsers = (req, res) => {
  try {
    const users = db
      .prepare("SELECT id, name, username, email, role, type FROM users ORDER BY id DESC")
      .all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = (req, res) => {
  try {
    const user = db
      .prepare("SELECT id, name, username, email, role, type FROM users WHERE id = ?")
      .get(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addUser = (req, res) => {
  try {
    const { name, username, email, password, type } = req.body;
    if (!name || !username || !password)
      return res.status(400).json({ message: "Name, username, and password are required" });

    const existing = db
      .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
      .get(username, email || null);
    if (existing) return res.status(409).json({ message: "Username or email already exists" });

    const hashed = bcrypt.hashSync(password, 10);
    const role = type || "basic";

    const insert = db.prepare(`
      INSERT INTO users (name, username, email, password, role, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(name, username, email || null, hashed, role, role);

    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, type } = req.body;

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = password ? bcrypt.hashSync(password, 10) : user.password;
    const role = type || user.type;

    const update = db.prepare(`
      UPDATE users
      SET name = ?, email = ?, password = ?, role = ?, type = ?
      WHERE id = ?
    `);
    update.run(name || user.name, email || user.email, hashed, role, role, id);

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
