const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// === REGISTER USER ===
exports.register = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });

  try {
    const userExist = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (userExist)
      return res.status(400).json({ success: false, message: "Username sudah digunakan" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [username, hashedPassword, role || "staff"],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.json({ success: true, message: "Registrasi berhasil!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// === LOGIN USER ===
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });

  try {
    const user = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user)
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ success: false, message: "Password salah" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: { username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// === GET PROFILE ===
exports.profile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await new Promise((resolve, reject) => {
      db.get("SELECT id, username, role FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
