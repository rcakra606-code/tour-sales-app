const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/database");

const SECRET = "travel_secret_key";

// Pastikan admin default dibuat
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT
)`);

db.get(`SELECT * FROM users WHERE username = ?`, ["admin"], (err, row) => {
  if (!row) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
      ["admin", hash, "admin"]
    );
    console.log("🧩 Admin default dibuat → username: admin | password: admin123");
  }
});

exports.login = (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: "Password salah" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET,
      { expiresIn: "2h" }
    );
    res.json({ token, username: user.username, role: user.role });
  });
};
