/**
 * routes/auth.js
 * FINAL BUILD (v2025.10)
 * ----------------------------------------------
 * Autentikasi & otorisasi JWT dengan role support.
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const TOKEN_EXPIRES = "7d"; // durasi token 7 hari

/* =====================================================
   REGISTER USER (khusus admin / super)
   ===================================================== */
router.post("/register", async (req, res) => {
  try {
    const { username, password, name, email, type } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username dan password wajib diisi" });

    const db = getDB();
    const exists = db.prepare("SELECT * FROM users WHERE username=?").get(username);
    if (exists) return res.status(400).json({ error: "Username sudah digunakan" });

    const hash = await bcrypt.hash(password, 10);
    db.prepare("INSERT INTO users (username, password, name, type) VALUES (?, ?, ?, ?)").run(
      username,
      hash,
      name || "",
      type || "basic"
    );

    res.json({ message: "User berhasil dibuat" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   LOGIN USER
   ===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Harap isi username & password" });

    const db = getDB();
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) return res.status(400).json({ error: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Password salah" });

    const token = jwt.sign(
      { id: user.id, username: user.username, type: user.type, name: user.name },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES }
    );

    res.json({
      token,
      user: { username: user.username, name: user.name, type: user.type },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   VERIFY TOKEN (untuk frontend)
   ===================================================== */
router.get("/verify", (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ ok: false, error: "Token tidak ditemukan" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ ok: false, error: "Token tidak valid" });
      res.json({ ok: true, user });
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* =====================================================
   RESET PASSWORD (opsional, hanya super)
   ===================================================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword)
      return res.status(400).json({ error: "Username dan password baru wajib diisi" });

    const db = getDB();
    const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    const hash = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password=? WHERE username=?").run(hash, username);

    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
