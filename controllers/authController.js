// =====================================
// ✅ Auth Controller
// =====================================
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/database");
const User = require("../models/userModels");

// Tambahan logging untuk diagnosa Render
console.log("📦 AuthController loaded, using database from:", require.resolve("../config/database"));

// =====================================
// ✅ REGISTER USER
// =====================================
exports.register = (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi." });
    }

    User.findByUsername(username, (err, existingUser) => {
      if (err) {
        console.error("❌ DB error:", err);
        return res.status(500).json({ message: "Kesalahan database." });
      }

      if (existingUser) {
        return res.status(400).json({ message: "Username sudah terdaftar." });
      }

      const hashed = bcrypt.hashSync(password, 10);

      User.create(username, hashed, role || "staff", (createErr) => {
        if (createErr) {
          console.error("❌ Error creating user:", createErr);
          return res.status(500).json({ message: "Gagal menambahkan pengguna." });
        }

        console.log(`✅ Pengguna baru terdaftar: ${username}`);
        res.json({ success: true, message: "Registrasi berhasil." });
      });
    });
  } catch (e) {
    console.error("❌ Register crash:", e);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// =====================================
// ✅ LOGIN USER
// =====================================
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi." });

    User.findByUsername(username, (err, user) => {
      if (err) {
        console.error("❌ DB error saat login:", err);
        return res.status(500).json({ message: "Kesalahan server saat login." });
      }

      if (!user) {
        console.warn("⚠️ Login gagal: user tidak ditemukan ->", username);
        return res.status(401).json({ message: "Username atau password salah." });
      }

      const validPass = bcrypt.compareSync(password, user.password);
      if (!validPass) {
        console.warn("⚠️ Login gagal: password salah untuk", username);
        return res.status(401).json({ message: "Username atau password salah." });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "8h" }
      );

      console.log(`✅ Login sukses: ${username} (${user.role})`);

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
  } catch (e) {
    console.error("❌ Crash di login:", e);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// =====================================
// ✅ VERIFY TOKEN
// =====================================
exports.verifyToken = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ valid: false, message: "Token tidak ditemukan." });

    jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, decoded) => {
      if (err) {
        console.warn("⚠️ Token invalid:", err.message);
        return res.status(403).json({ valid: false, message: "Token tidak valid." });
      }
      res.json({ valid: true, user: decoded });
    });
  } catch (e) {
    console.error("❌ VerifyToken crash:", e);
    res.status(500).json({ valid: false, message: "Kesalahan server." });
  }
};
