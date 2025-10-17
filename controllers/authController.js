// controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username dan password wajib diisi." });

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) return res.status(401).json({ error: "User tidak ditemukan." });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: "Password salah." });

  const token = jwt.sign({ username, type: user.type }, JWT_SECRET, {
    expiresIn: "8h",
  });

  res.json({
    token,
    user: { username, name: user.name, email: user.email, type: user.type },
  });
};

exports.verifyToken = (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ valid: false });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
};
