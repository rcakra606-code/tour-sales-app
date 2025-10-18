/**
 * ==========================================================
 * routes/users.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ CRUD User Management (super & semi)
 * ✅ PostgreSQL + bcryptjs
 * ✅ Logging setiap aksi
 * ✅ Role-based Access (super, semi, basic)
 * ==========================================================
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/database");
const auth = require("../middleware/auth");
const { logAction } = require("../middleware/log");
const { requireRole } = require("../middleware/roleCheck");

const router = express.Router();

// Semua endpoint dilindungi JWT
router.use(auth);

/**
 * ==========================================================
 * GET /api/users
 * Ambil semua user (super & semi)
 * ==========================================================
 */
router.get("/", requireRole("super", "semi"), async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, name, type, created_at FROM users ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error GET /users:", err.message);
    res.status(500).json({ error: "Gagal memuat daftar user" });
  }
});

/**
 * ==========================================================
 * GET /api/users/:id
 * Ambil detail user
 * ==========================================================
 */
router.get("/:id", requireRole("super", "semi"), async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, username, name, type FROM users WHERE id=$1",
      [req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "User tidak ditemukan" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error GET /users/:id:", err.message);
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
});

/**
 * ==========================================================
 * POST /api/users
 * Tambah user baru (super only)
 * ==========================================================
 */
router.post("/", requireRole("super"), async (req, res) => {
  try {
    const { username, name, password, type } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Username dan password wajib diisi" });

    const exists = await db.query("SELECT id FROM users WHERE username=$1", [
      username,
    ]);
    if (exists.rowCount > 0)
      return res.status(400).json({ error: "Username sudah terdaftar" });

    const hashed = bcrypt.hashSync(password, 10);
    await db.query(
      "INSERT INTO users (username, password, name, type) VALUES ($1,$2,$3,$4)",
      [username, hashed, name || username, type || "basic"]
    );

    await logAction(req.user, "Menambahkan User", username);
    res.json({ message: "✅ User berhasil ditambahkan" });
  } catch (err) {
    console.error("❌ Error POST /users:", err.message);
    res.status(500).json({ error: "Gagal menambahkan user" });
  }
});

/**
 * ==========================================================
 * PUT /api/users/:id
 * Edit data user (super & semi)
 * ==========================================================
 */
router.put("/:id", requireRole("super", "semi"), async (req, res) => {
  try {
    const { username, name, password, type } = req.body;
    const id = req.params.id;

    const userRes = await db.query("SELECT * FROM users WHERE id=$1", [id]);
    if (userRes.rowCount === 0)
      return res.status(404).json({ error: "User tidak ditemukan" });

    const user = userRes.rows[0];

    const newUsername = username || user.username;
    const newName = name || user.name;
    const newType = type || user.type;

    let updateQuery, params;
    if (password && password.trim() !== "") {
      const hashed = bcrypt.hashSync(password, 10);
      updateQuery =
        "UPDATE users SET username=$1, name=$2, password=$3, type=$4 WHERE id=$5";
      params = [newUsername, newName, hashed, newType, id];
    } else {
      updateQuery =
        "UPDATE users SET username=$1, name=$2, type=$3 WHERE id=$4";
      params = [newUsername, newName, newType, id];
    }

    await db.query(updateQuery, params);
    await logAction(req.user, "Mengubah Data User", newUsername);

    res.json({ message: "✅ Data user berhasil diperbarui" });
  } catch (err) {
    console.error("❌ Error PUT /users/:id:", err.message);
    res.status(500).json({ error: "Gagal memperbarui data user" });
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
    const id = req.params.id;
    const result = await db.query("SELECT username FROM users WHERE id=$1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: "User tidak ditemukan" });

    const username = result.rows[0].username;
    await db.query("DELETE FROM users WHERE id=$1", [id]);
    await logAction(req.user, "Menghapus User", username);

    res.json({ message: "🗑️ User berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error DELETE /users/:id:", err.message);
    res.status(500).json({ error: "Gagal menghapus user" });
  }
});

module.exports = router;
