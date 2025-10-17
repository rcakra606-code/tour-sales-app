const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/* ===========================================================
   GET /api/profile
   Ambil profil user login
=========================================================== */
exports.getProfile = (req, res) => {
  try {
    const username = req.user.username;
    const profile = db.prepare("SELECT username, name, email, type FROM users WHERE username = ?").get(username);
    if (!profile) return res.status(404).json({ error: "User tidak ditemukan." });
    res.json(profile);
  } catch (err) {
    console.error("getProfile error:", err.message);
    res.status(500).json({ error: "Gagal mengambil profil." });
  }
};

/* ===========================================================
   PUT /api/profile
   Hanya admin yang bisa ubah profil user lain
=========================================================== */
exports.updateProfile = (req, res) => {
  try {
    const { username, name, email } = req.body;
    if (req.user.type !== "super")
      return res.status(403).json({ error: "Hanya admin yang dapat mengubah profil." });

    db.prepare("UPDATE users SET name=?, email=? WHERE username=?").run(name, email, username);
    res.json({ ok: true, message: "Profil user berhasil diperbarui." });
  } catch (err) {
    console.error("updateProfile error:", err.message);
    res.status(500).json({ error: "Gagal memperbarui profil." });
  }
};
