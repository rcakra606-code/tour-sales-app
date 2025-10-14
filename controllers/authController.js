const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// === REGISTER USER ===
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi" });
    }

    // Cek apakah user sudah ada
    const userExists = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (userExists) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    // Hash password pakai bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke database
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [username, hashedPassword, role || "staff"],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    console.error("Error register:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// === LOGIN USER ===
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Ambil user berdasarkan username
    const user = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Bandingkan password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// === VALIDASI TOKEN ===
exports.validateToken = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Token tidak ditemukan" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, user) => {
      if (err) return res.status(403).json({ message: "Token tidak valid" });
      res.json({ valid: true, user });
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
