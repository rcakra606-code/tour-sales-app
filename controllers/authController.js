// controllers/authController.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_env";

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

exports.login = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username dan password wajib diisi" });

    // 🔹 Ambil user berdasarkan username
    const foundUser = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!foundUser) return res.status(404).json({ message: "User tidak ditemukan" });

    // 🔹 Verifikasi password
    const valid = bcrypt.compareSync(password, foundUser.password);
    if (!valid) return res.status(401).json({ message: "Password salah" });

    // 🔹 Buat JWT token
    const payload = {
      id: foundUser.id,
      username: foundUser.username,
      name: foundUser.name,
      type: foundUser.type || foundUser.role || "basic",
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: sanitizeUserRow(foundUser) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
