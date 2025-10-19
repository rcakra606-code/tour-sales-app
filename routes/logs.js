/**
 * ==========================================================
 * routes/logs.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Menampilkan activity logs (audit trail)
 * ✅ Hapus log (khusus super)
 * ✅ Middleware auth & role
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");
const logger = require("../config/logger");
const db = require("../config/database").getDB();

// ============================================================
// 📘 GET /api/logs
// Ambil semua log (bisa filter ?user= atau ?role=)
// ============================================================
router.get("/", verifyToken, roleCheck(["super", "semi"]), async (req, res) => {
  try {
    const { user, role } = req.query;
    let query = "SELECT * FROM logs WHERE 1=1";
    const params = [];

    if (user) {
      query += " AND LOWER(username) LIKE ?";
      params.push(`%${user.toLowerCase()}%`);
    }

    if (role) {
      query += " AND LOWER(role) = ?";
      params.push(role.toLowerCase());
    }

    query += " ORDER BY timestamp DESC";
    const logs = await db.all(query, params);

    res.json(logs);
  } catch (err) {
    logger.error("❌ Error mengambil data logs:", err);
    res.status(500).json({ message: "Gagal mengambil data log aktivitas" });
  }
});

// ============================================================
// 🗑️ DELETE /api/logs/:id
// Hapus 1 log berdasarkan ID (khusus super)
// ============================================================
router.delete("/:id", verifyToken, roleCheck(["super"]), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.get("SELECT id FROM logs WHERE id = ?", [id]);

    if (!existing) {
      return res.status(404).json({ message: "Log tidak ditemukan" });
    }

    await db.run("DELETE FROM logs WHERE id = ?", [id]);
    logger.info(`🗑️ Log ID ${id} dihapus oleh ${req.user.username}`);
    res.json({ message: "✅ Log berhasil dihapus" });
  } catch (err) {
    logger.error("❌ Error menghapus log:", err);
    res.status(500).json({ message: "Gagal menghapus log" });
  }
});

// ============================================================
// 🧹 DELETE /api/logs/clear
// Hapus semua log (khusus super)
// ============================================================
router.delete("/clear/all", verifyToken, roleCheck(["super"]), async (req, res) => {
  try {
    await db.run("DELETE FROM logs");
    logger.warn(`🧹 Semua log aktivitas dihapus oleh ${req.user.username}`);
    res.json({ message: "🧹 Semua log aktivitas berhasil dihapus" });
  } catch (err) {
    logger.error("❌ Error menghapus semua log:", err);
    res.status(500).json({ message: "Gagal menghapus semua log" });
  }
});

module.exports = router;
