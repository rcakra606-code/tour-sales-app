// controllers/userController.js — Final with Role-based User Management
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/* ===========================================================
   📌 Helper function: role access
=========================================================== */
function canManage(targetUser, currentUser) {
  if (!currentUser) return false;
  if (currentUser.type === "super") return true; // admin can manage all
  if (currentUser.type === "semi" && targetUser.type === "basic") return true; // semi can manage basic
  return false;
}

/* ===========================================================
   📄 GET /api/users
   Role-based: 
   - basic → hanya dirinya
   - semi → semua basic
   - admin → semua
=========================================================== */
exports.getAllUsers = (req, res) => {
  try {
    const role = req.user?.type;
    const username = req.user?.username;

    let users = [];
    if (role === "super") {
      users = db.prepare("SELECT username, name, email, type, created_at FROM users ORDER BY username ASC").all();
    } else if (role === "semi") {
      users = db
        .prepare("SELECT username, name, email, type, created_at FROM users WHERE type = 'basic' ORDER BY username ASC")
        .all();
    } else {
      users = db
        .prepare("SELECT username, name, email, type, created_at FROM users WHERE username = ?")
        .all(username);
    }

    res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data user." });
  }
};

/* ===========================================================
   ➕ POST /api/users
   Admin only
=========================================================== */
exports.createUser = (req, res) => {
  try {
    const { username, password, name, email, type } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username dan password wajib diisi." });

    const exists = db.prepare("SELECT username FROM users WHERE username = ?").get(username);
    if (exists)
      return res.status(400).json({ error: "Username sudah digunakan." });

    const hash = bcrypt.hashSync(password, 8);
    db.prepare("INSERT INTO users (username, password, name, email, type) VALUES (?,?,?,?,?)")
      .run(username, hash, name || username, email || "", type || "basic");

    res.json({ ok: true, message: "User berhasil ditambahkan." });
  } catch (err) {
    console.error("createUser error:", err.message);
    res.status(500).json({ error: "Gagal menambah user." });
  }
};

/* ===========================================================
   ✏️ PUT /api/users
   Admin: update semua
   Semi: update basic only
=========================================================== */
exports.updateUser = (req, res) => {
  try {
    const { username, name, email, type } = req.body;
    if (!username)
      return res.status(400).json({ error: "Username wajib diisi." });

    const target = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!target)
      return res.status(404).json({ error: "User tidak ditemukan." });

    if (!canManage(target, req.user))
      return res.status(403).json({ error: "Tidak diizinkan mengubah user ini." });

    // hanya admin yang bisa ubah role
    let newType = target.type;
    if (req.user.type === "super" && type) newType = type;

    db.prepare("UPDATE users SET name=?, email=?, type=? WHERE username=?")
      .run(name || target.name, email || target.email, newType, username);

    res.json({ ok: true, message: "User berhasil diperbarui." });
  } catch (err) {
    console.error("updateUser error:", err.message);
    res.status(500).json({ error: "Gagal memperbarui user." });
  }
};

/* ===========================================================
   🗑️ DELETE /api/users/:username
   Hanya admin
=========================================================== */
exports.deleteUser = (req, res) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: "Username wajib diisi." });
    if (username === "admin") return res.status(400).json({ error: "Admin utama tidak bisa dihapus." });

    db.prepare("DELETE FROM users WHERE username = ?").run(username);
    res.json({ ok: true, message: "User berhasil dihapus." });
  } catch (err) {
    console.error("deleteUser error:", err.message);
    res.status(500).json({ error: "Gagal menghapus user." });
  }
};

/* ===========================================================
   🔑 POST /api/users/change-password
   Semua user bisa ganti password sendiri
=========================================================== */
exports.changePassword = (req, res) => {
  try {
    const username = req.user?.username;
    const { oldPassword, newPassword } = req.body;

    if (!username) return res.status(401).json({ error: "Unauthorized." });
    if (!oldPassword || !newPassword)
      return res.status(400).json({ error: "Password lama dan baru wajib diisi." });

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) return res.status(404).json({ error: "User tidak ditemukan." });

    const valid = bcrypt.compareSync(oldPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Password lama salah." });

    const hash = bcrypt.hashSync(newPassword, 8);
    db.prepare("UPDATE users SET password=? WHERE username=?").run(hash, username);

    res.json({ ok: true, message: "Password berhasil diubah." });
  } catch (err) {
    console.error("changePassword error:", err.message);
    res.status(500).json({ error: "Gagal mengubah password." });
  }
};

/* ===========================================================
   🔁 POST /api/users/reset-password
   - Admin dapat reset semua user
   - Semi admin hanya dapat reset basic user
=========================================================== */
exports.resetPassword = (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username wajib diisi." });

    const target = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!target)
      return res.status(404).json({ error: "User tidak ditemukan." });

    if (!canManage(target, req.user))
      return res.status(403).json({ error: "Tidak diizinkan mereset password user ini." });

    const defaultPassword = `${username}123`;
    const hash = bcrypt.hashSync(defaultPassword, 8);

    db.prepare("UPDATE users SET password=? WHERE username=?").run(hash, username);
    res.json({ ok: true, message: `Password user direset menjadi: ${defaultPassword}` });
  } catch (err) {
    console.error("resetPassword error:", err.message);
    res.status(500).json({ error: "Gagal mereset password." });
  }
};

/* ===========================================================
   🔓 POST /api/users/unlock
   Hanya admin (super)
=========================================================== */
exports.unlockUser = (req, res) => {
  try {
    const { username } = req.body;
    if (!username)
      return res.status(400).json({ error: "Username wajib diisi." });

    db.prepare("UPDATE users SET locked = 0, failed_attempts = 0 WHERE username = ?").run(username);
    res.json({ ok: true, message: `Akun ${username} telah dibuka kuncinya.` });
  } catch (err) {
    console.error("unlockUser error:", err.message);
    res.status(500).json({ error: "Gagal membuka kunci user." });
  }
};
