/**
 * ==========================================================
 * routes/users.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ PostgreSQL (Neon) compatible
 * ✅ bcryptjs hashing (no native compile)
 * ✅ Role-based Access (super / semi)
 * ✅ Audit Logging Integration
 * ==========================================================
 */

const express = require("express");
const bcrypt = require("bcryptjs"); // Render-safe
const { Pool } = require("pg");
const { logAction } = require("../middleware/log");
const auth = require("../middleware/auth");

const router = express.Router();

// PostgreSQL Pool (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Role check middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.type)) {
      return res.status(403).json({ error: "Akses ditolak" });
    }
    next();
  };
}

// Protect all routes
router.use(auth);

/**
 * ==========================================================
 * GET /api/users
 * Ambil semua user (hanya super/semi)
 * ==========================================================
 */
router.get("/", requireRole("super", "semi"), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, name, type, created_at FROM users ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error GET /users:", err);
    res.status(500).json({ error: "Gagal memuat data user" });
  }
});

/**
 * ==========================================================
 * POST /api/users
 * Tambah user baru (super/semi)
 * ==========================================================
 */
router.post("/", requireRole("super", "semi"), async (req, res) => {
  try {
    const { username, password, name, type } = req.body;

    if (!username || !password || !name)
      return res.status(400).json({ error: "Semua field wajib diisi" });

    const hashed = bcrypt.hashSync(password, 10);
    await pool.query(
      "INSERT INTO users (username, password, name, type) VALUES ($1, $2, $3, $4)",
      [username, hashed, name, type || "basic"]
    );

    await logAction(req.user, "Menambahkan User", username);
    res.json({ message: "✅ User berhasil ditambahkan" });
  } catch (err) {
    console.error("❌ Error POST /users:", err);
    res.status(500).json({ error: "Gagal menambah user" });
  }
});

/**
 * ==========================================================
 * PUT /api/users/:id
 * Update nama / role user (super & semi)
 * ==========================================================
 */
router.put("/:id", requireRole("super", "semi"), async (req, res) => {
  try {
    const { name, type } = req.body;
    const id = req.params.id;

    const result = await pool.query("SELECT username FROM users WHERE id=$1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: "User tidak ditemukan" });

    const username = result.rows[0].username;

    if (req.user.type === "semi") {
      await pool.query("UPDATE users SET name=$1 WHERE id=$2", [name, id]);
    } else {
      await pool.query("UPDATE users SET name=$1, type=$2 WHERE id=$3", [name, type, id]);
    }

    await logAction(req.user, "Memperbarui Data User", username);
    res.json({ message: "✅ Data user berhasil diperbarui" });
  } catch (err) {
    console.error("❌ Error PUT /users/:id:", err);
    res.status(500).json({ error: "Gagal memperbarui user" });
  }
});

/**
 * ==========================================================
 * PUT /api/users/:id/reset-password
 * Reset password user (super only)
 * ==========================================================
 */
router.put("/:id/reset-password", requireRole("super"), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword)
      return res.status(400).json({ error: "Password baru wajib diisi" });

    const result = await pool.query("SELECT username FROM users WHERE id=$1", [req.params.id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: "User tidak ditemukan" });

    const username = result.rows[0].username;
    const hashed = bcrypt.hashSync(newPassword, 10);

    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hashed, req.params.id]);
    await logAction(req.user, "Reset Password User", username);
    res.json({ message: "✅ Password user berhasil direset" });
  } catch (err) {
    console.error("❌ Error reset password:", err);
    res.status(500).json({ error: "Gagal reset password" });
  }
});

/**
 * ==========================================================
 * DELETE /api/users/:id
 * Hapus user (super only)
 * ==========================================================
 */
router.delete("/:id", requireRole("super"), async (req, res) => {
  try {
    const result = await pool.query("SELECT username FROM users WHERE id=$1", [req.params.id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: "User tidak ditemukan" });

    const username = result.rows[0].username;

    if (username === req.user.username)
      return res.status(400).json({ error: "Tidak dapat menghapus akun sendiri" });

    await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
    await logAction(req.user, "Menghapus User", username);
    res.json({ message: "🗑️ User berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error DELETE /users/:id:", err);
    res.status(500).json({ error: "Gagal menghapus user" });
  }
});

module.exports = router;
