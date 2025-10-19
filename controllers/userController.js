/**
 * ==========================================================
 * controllers/userController.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ CRUD User
 * ✅ Role-based management
 * ✅ Password hashing (bcryptjs)
 * ✅ Logging aktivitas user
 * ==========================================================
 */

const db = require("../config/database").getDB();
const bcrypt = require("bcryptjs");
const logger = require("../config/logger");

// ============================================================
// 📘 GET /api/users
// Ambil semua user
// ============================================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.all("SELECT id, username, role, created_at FROM users ORDER BY id ASC");
    logger.info(`👥 ${req.user.username} melihat daftar user`);
    res.json(users);
  } catch (err) {
    logger.error("❌ Error mengambil data user:", err);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

// ============================================================
// 📘 GET /api/users/:id
// Ambil detail user berdasarkan ID
// ============================================================
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.get("SELECT id, username, role, created_at FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    res.json(user);
  } catch (err) {
    logger.error("❌ Error mengambil user by ID:", err);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

// ============================================================
// 🟢 POST /api/users
// Tambah user baru
// ============================================================
exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi" });
    }

    const existing = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (existing) {
      return res.status(409).json({ message: "Username sudah digunakan" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
      username.trim(),
      hashed,
      role || "basic",
    ]);

    logger.info(`✅ User '${username}' berhasil dibuat oleh ${req.user.username}`);
    res.json({ message: "✅ User baru berhasil ditambahkan" });
  } catch (err) {
    logger.error("❌ Error menambahkan user:", err);
    res.status(500).json({ message: "Gagal menambahkan user" });
  }
};

// ============================================================
// 🟡 PUT /api/users/:id
// Update data user (username, password, role)
// ============================================================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    let hashed = user.password;
    if (password && password.trim() !== "") {
      hashed = await bcrypt.hash(password, 10);
    }

    await db.run(
      "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
      [username || user.username, hashed, role || user.role, id]
    );

    logger.info(`✏️ User ID ${id} diperbarui oleh ${req.user.username}`);
    res.json({ message: "✅ Data user berhasil diperbarui" });
  } catch (err) {
    logger.error("❌ Error memperbarui user:", err);
    res.status(500).json({ message: "Gagal memperbarui data user" });
  }
};

// ============================================================
// 🔴 DELETE /api/users/:id
// Hapus user (khusus super admin)
// ============================================================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    await db.run("DELETE FROM users WHERE id = ?", [id]);
    logger.warn(`🗑️ User '${user.username}' dihapus oleh ${req.user.username}`);
    res.json({ message: "✅ User berhasil dihapus" });
  } catch (err) {
    logger.error("❌ Error menghapus user:", err);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
};

// ============================================================
// 🔄 PATCH /api/users/:id/role
// Ubah role user (super, semi, basic)
// ============================================================
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["super", "semi", "basic"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Role tidak valid" });
    }

    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    await db.run("UPDATE users SET role = ? WHERE id = ?", [role, id]);

    logger.info(`🔄 Role user '${user.username}' diubah menjadi '${role}' oleh ${req.user.username}`);
    res.json({ message: `✅ Role user berhasil diubah menjadi '${role}'` });
  } catch (err) {
    logger.error("❌ Error mengubah role user:", err);
    res.status(500).json({ message: "Gagal mengubah role user" });
  }
};
