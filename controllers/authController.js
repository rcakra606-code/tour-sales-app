const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/database");

console.log("📦 AuthController loaded, using better-sqlite3");

// =====================================
// ✅ REGISTER USER
// =====================================
exports.register = (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi." });

    const existing = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (existing) return res.status(400).json({ message: "Username sudah terdaftar." });

    const hashed = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(
      username,
      hashed,
      role || "staff"
    );

    console.log(`👤 New user registered: ${username} (role: ${role || "staff"})`);
    res.json({ success: true, message: "Registrasi berhasil." });
  } catch (err) {
    console.error("❌ Register error:", err);
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

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) return res.status(401).json({ message: "Username atau password salah." });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: "Username atau password salah." });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "8h" }
    );

    console.log(`✅ Login sukses: ${username} (${user.role})`);
    res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Kesalahan server saat login." });
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
      if (err) return res.status(403).json({ valid: false, message: "Token tidak valid." });
      res.json({ valid: true, user: decoded });
    });
  } catch (err) {
    console.error("❌ VerifyToken error:", err);
    res.status(500).json({ valid: false, message: "Kesalahan server." });
  }
};
