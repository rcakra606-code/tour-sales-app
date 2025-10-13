// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES = "8h";

// ==============================
// 🔹 REGISTER USER (admin/staff)
// ==============================
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username & password wajib diisi" });
    }

    const exists = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (exists) {
      return res.status(400).json({ success: false, message: "Username sudah terdaftar" });
    }

    const hashed = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(
      username,
      hashed,
      role || "staff"
    );

    console.log(`👤 User baru terdaftar: ${username} (role: ${role || "staff"})`);
    res.json({ success: true, message: "Registrasi berhasil" });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ success: false, message: "Kesalahan server" });
  }
});

// ==============================
// 🔹 LOGIN USER
// ==============================
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username & password wajib diisi" });
    }

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) {
      console.warn("⚠️ Login gagal: user tidak ditemukan ->", username);
      return res.status(401).json({ success: false, message: "Username atau password salah" });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      console.warn("⚠️ Login gagal: password salah ->", username);
      return res.status(401).json({ success: false, message: "Username atau password salah" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    console.log(`✅ Login sukses: ${username} (${user.role})`);
    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ success: false, message: "Kesalahan server" });
  }
});

// ==============================
// 🔹 VERIFY TOKEN
// ==============================
router.get("/verify", (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ valid: false, message: "Token tidak valid" });
      }
      res.json({ valid: true, user: decoded });
    });
  } catch (err) {
    console.error("❌ Verify token error:", err.message);
    res.status(500).json({ valid: false, message: "Kesalahan server" });
  }
});

module.exports = router;
