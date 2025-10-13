const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/database");

module.exports = {
  register: (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username dan password wajib diisi." });

    const exists = db.prepare("SELECT * FROM users WHERE username=?").get(username);
    if (exists) return res.status(400).json({ message: "Username sudah terdaftar." });

    const hashed = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO users (username, password, role) VALUES (?,?,?)").run(username, hashed, role || "staff");
    res.json({ success: true, message: "Registrasi berhasil." });
  },

  login: (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username dan password wajib diisi." });

    const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);
    if (!user) return res.status(401).json({ message: "Username atau password salah." });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: "Username atau password salah." });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || "secretkey", { expiresIn: "8h" });
    res.json({ success: true, token, user: { id: user.id, username: user.username, role: user.role } });
  }
};
