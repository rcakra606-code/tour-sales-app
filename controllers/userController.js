// controllers/userController.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");

// GET /api/users (list)
exports.list = (req, res) => {
  try {
    const rows = db.prepare("SELECT id,name,username,email,role,type FROM users ORDER BY name").all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/users (create) — only super allowed (route protected)
exports.create = (req, res) => {
  try {
    const { name, username, email, password, type } = req.body;
    if (!name || !username || !password) return res.status(400).json({ message: "name, username, password required" });
    const exists = db.prepare("SELECT id FROM users WHERE username = ? OR email = ?").get(username, email || null);
    if (exists) return res.status(409).json({ message: "Username or email already" });
    const hashed = bcrypt.hashSync(password, 10);
    const role = type === "super" || type === "semi" ? type : "basic";
    const info = db.prepare("INSERT INTO users (name,email,username,password,role,type) VALUES (?,?,?,?,?,?)")
      .run(name,email||null,username,hashed,role,type||"basic");
    res.json({ id: info.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
