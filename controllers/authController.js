const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const createAdminIfMissing = () => {
  const admin = db.prepare("SELECT * FROM users WHERE username=?").get("admin");
  if (!admin) {
    const hashed = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", hashed, "admin");
    console.log("🧩 Admin default dibuat → username: admin | password: admin123");
  }
};

createAdminIfMissing();

exports.register = (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username dan password wajib diisi" });

  const existing = db.prepare("SELECT * FROM users WHERE username=?").get(username);
  if (existing) return res.status(400).json({ message: "Username sudah terdaftar" });

  const hashed = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(username, hashed, role || "staff");
  res.json({ success: true, message: "Registrasi berhasil" });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: "Username atau password salah" });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || "secretkey", { expiresIn: "8h" });
  res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role } });
};

exports.verifyToken = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ valid: false, message: "Token tidak ditemukan" });

  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, decoded) => {
    if (err) return res.status(403).json({ valid: false, message: "Token tidak valid" });
    res.json({ valid: true, user: decoded });
  });
};
