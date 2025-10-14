// controllers/authController.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_env";

function sanitizeUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email || null,
    role: row.role || null,
    type: row.type || (row.role || 'basic')
  };
}

exports.register = (req, res) => {
  try {
    const { name, username, email, password, type } = req.body;
    if (!name || !username || !password) return res.status(400).json({ message: "name, username, password required" });

    const exists = db.prepare("SELECT id FROM users WHERE username = ? OR email = ?").get(username, email || null);
    if (exists) return res.status(409).json({ message: "Username or email already registered" });

    const hashed = bcrypt.hashSync(password, 10);
    let role = "basic";
    let userType = "basic";
    if (type === "super" || type === "semi") { role = type; userType = type; }

    const insert = db.prepare("INSERT INTO users (name,email,username,password,role,type) VALUES (?,?,?,?,?,?)");
    const info = insert.run(name, email || null, username, hashed, role, userType);

    const newUser = db.prepare("SELECT id,name,username,email,role,type FROM users WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({ message: "User registered", user: sanitizeUserRow(newUser) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "username and password required" });

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid username or password" });

    const payload = { id: user.id, username: user.username, name: user.name, type: user.type || user.role || "basic" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: sanitizeUserRow(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
