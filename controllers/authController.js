// controllers/authController.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_env";

// 🧹 Helper untuk bersihkan data user sebelum dikirim ke frontend
function sanitizeUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email || null,
    role: row.role || "basic",
    type: row.type || row.role || "basic",
  };
}

// ========================== REGISTER ==========================
exports.register = (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi" });

    const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (exists)
      return res.status(400).json({ message: "Username sudah digunakan" });

    const hashed = bcrypt.hashSync(password, 10);
    db.prepare(`
      INSERT INTO users (name, username, email, password, role, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name || username, username, email || null, hashed, role || "basic", role || "basic");

    res.json({ message: "User berhasil didaftarkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================== LOGIN ==========================
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi" });

    const foundUser = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!foundUser)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const valid = bcrypt.compareSync(password, foundUser.password);
    if (!valid)
      return res.status(401).json({ message: "Password salah" });

    const payload = {
      id: foundUser.id,
      username: foundUser.username,
      name: foundUser.name,
      type: foundUser.type || foundUser.role || "basic",
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: sanitizeUserRow(foundUser),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================== PROFILE (OPTIONAL) ==========================
exports.profile = (req, res) => {
  try {
    const foundUser = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    res.json(sanitizeUserRow(foundUser));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========================== CHANGE PASSWORD ==========================
exports.changePassword = (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const foundUser = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    if (!foundUser) return res.status(404).json({ message: "User tidak ditemukan" });

    const valid = bcrypt.compareSync(oldPassword, foundUser.password);
    if (!valid) return res.status(401).json({ message: "Password lama salah" });

    const hashed = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, req.user.id);

    res.json({ message: "Password berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
