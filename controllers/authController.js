const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const db = new Database("./data/travel.db");

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username & password wajib diisi" });

  const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);
  if (!user) return res.status(401).json({ message: "Username atau password salah" });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Username atau password salah" });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || "secretkey", { expiresIn: "8h" });
  res.json({ token, username: user.username, role: user.role });
};
