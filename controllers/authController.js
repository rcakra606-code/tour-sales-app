// =====================================
// ✅ Auth Controller
// =====================================
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/database");
const User = require("../models/userModel");

exports.register = (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username dan password wajib diisi." });

  User.findByUsername(username, (err, user) => {
    if (user)
      return res.status(400).json({ message: "Username sudah terdaftar." });

    const hashed = bcrypt.hashSync(password, 10);
    User.create(username, hashed, role, (err2) => {
      if (err2)
        return res.status(500).json({ message: "Gagal mendaftar pengguna." });
      res.json({ success: true, message: "Registrasi berhasil." });
    });
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  User.findByUsername(username, (err, user) => {
    if (!user)
      return res.status(401).json({ message: "Username atau password salah." });

    const validPass = bcrypt.compareSync(password, user.password);
    if (!validPass)
      return res.status(401).json({ message: "Username atau password salah." });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      message: "Login berhasil.",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  });
};

exports.verifyToken = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ valid: false });

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, decoded) => {
    if (err) return res.status(403).json({ valid: false });
    res.json({ valid: true, user: decoded });
  });
};
