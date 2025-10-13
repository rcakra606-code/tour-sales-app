const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");
const db = require("../config/database");

console.log("📦 AuthController loaded");

// ==============================
// ✅ REGISTER USER
// ==============================
exports.register = (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi." });

    const existingUser = User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username sudah terdaftar." });
    }

    const hashed = bcrypt.hashSync(password, 10);
    User.create(username, hashed, role || "staff");

    console.log(`👤 New user registered: ${username} (role: ${role || "staff"})`);
    res.json({ success: true, message: "Registrasi berhasil." });
  } catch (err) {
    console.error("❌ Register crash:", err);
    res.status(500).json({ message: "Kesalahan server saat registrasi." });
  }
};

// ==============================
// ✅ LOGIN USER
// ==============================
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi." });

    const user = User.findByUsername(username);
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
  } catch (err) {
    console.error("❌ Login crash:", err);
    res.status(500).json({ message: "Kesalahan server saat login." });
  }
};

// ==============================
// ✅ VERIFY TOKEN
// ==============================
exports.verifyToken = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ valid: false, message: "Token tidak ditemukan." });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, decoded) => {
      if (err) return res.status(403).json({ valid: false, message: "Token tidak valid." });
      res.json({ valid: true, user: decoded });
    });
  } catch (err) {
    console.error("❌ VerifyToken crash:", err);
    res.status(500).json({ valid: false, message: "Kesalahan server." });
  }
};
