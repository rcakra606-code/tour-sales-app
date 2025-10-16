// controllers/authController.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_env";

// === Helper: sanitize output user ===
function sanitizeUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email || null,
    role: row.role || row.type || "basic",
    type: row.type || row.role || "basic",
  };
}

// === Auto-create default admin ===
(function ensureAdminExists() {
  try {
    const admin = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
    if (!admin) {
      const hashed = bcrypt.hashSync("admin123", 10);
      db.prepare(`
        INSERT INTO users (name, username, email, password, role, type)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run("Administrator", "admin", "admin@example.com", hashed, "super", "super");
      console.log("⚙️ Default admin account created (admin / admin123)");
    } else {
      console.log("✅ Admin account already exists");
    }
  } catch (err) {
    console.error("❌ Failed to ensure admin account:", err.message);
  }
})();

// === Register ===
exports.register = (req, res) => {
  try {
    const { name, username, email, password, type } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ message: "name, username, password required" });
    }

    const exists = db.prepare("SELECT id FROM users WHERE username = ? OR email = ?").get(username, email || null);
    if (exists) return res.status(409).json({ message: "Username or email already registered" });

    const hashed = bcrypt.hashSync(password, 10);
    const role = type === "super" || type === "semi" ? type : "basic";

    const insert = db.prepare(`
      INSERT INTO users (name, email, username, password, role, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = insert.run(name, email || null, username, hashed, role, role);

    const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json({ message: "User registered successfully", user: sanitizeUserRow(newUser) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === Login ===
exports.login = (req, res) => {
  try {
    const { username, email, password } = req.body;
    if ((!username && !email) || !password)
      return res.status(400).json({ message: "Username/email dan password wajib diisi" });

    const user = db
      .prepare("SELECT * FROM users WHERE username = ? OR email = ?")
      .get(username || email, username || email);

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: "Password salah" });

    const payload = { id: user.id, username: user.username, name: user.name, type: user.type || user.role || "basic" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: sanitizeUserRow(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
