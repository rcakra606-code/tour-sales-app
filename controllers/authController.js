// controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/database");
require("dotenv").config();

console.log("📦 AuthController loaded");

exports.register = (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi." });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ message: "Kesalahan database." });
    if (user) return res.status(400).json({ message: "Username sudah digunakan." });

    const hashed = bcrypt.hashSync(password, 10);
    db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashed, role || "staff"],
      (err2) => {
        if (err2) return res.status(500).json({ message: "Gagal membuat pengguna." });
        res.json({ success: true, message: "Registrasi berhasil." });
      }
    );
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username dan password wajib diisi." });

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ message: "Kesalahan database." });
    if (!user) return res.status(401).json({ message: "Username atau password salah." });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: "Username atau password salah." });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      message: "Login berhasil.",
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  });
};

exports.verifyToken = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ valid: false, message: "Token tidak ditemukan." });

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, decoded) => {
    if (err) return res.status(403).json({ valid: false, message: "Token tidak valid." });
    res.json({ valid: true, user: decoded });
  });
};
