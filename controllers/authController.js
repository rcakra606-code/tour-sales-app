// controllers/authController.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "supersecret";

exports.login = (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }

  const validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: "Password salah" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login berhasil",
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
};

// Endpoint untuk register admin/staff (opsional)
exports.register = (req, res) => {
  const { username, password, role } = req.body;
  const hashed = bcrypt.hashSync(password, 10);

  try {
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(username, hashed, role || "staff");
    res.json({ message: "User berhasil didaftarkan" });
  } catch (err) {
    res.status(400).json({ message: "Gagal mendaftarkan user", error: err.message });
  }
};
