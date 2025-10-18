/**
 * ==========================================================
 * routes/logs.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ PostgreSQL (Neon) Ready
 * ✅ Menampilkan audit logs
 * ✅ Filter berdasarkan user, role, dan aksi
 * ✅ Pagination untuk performa tinggi
 * ==========================================================
 */

const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");

const router = express.Router();

// Middleware: hanya super/semi yang boleh akses log
router.use(auth);
router.use(requireRole("super", "semi"));

/**
 * ==========================================================
 * GET /api/logs
 * Ambil daftar log aktivitas dengan pagination & filter opsional
 * Query params:
 *  - page (default 1)
 *  - limit (default 20)
 *  - username (opsional)
 *  - role (opsional)
 *  - action (opsional)
 * ==========================================================
 */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, username, role, action } = req.query;
    const offset = (page - 1) * limit;

    // Filter dinamis
    const filters = [];
    const params = [];
    let paramIndex = 1;

    if (username) {
      filters.push(`LOWER(username) LIKE LOWER($${paramIndex++})`);
      params.push(`%${username}%`);
    }
    if (role) {
      filters.push(`LOWER(role) = LOWER($${paramIndex++})`);
      params.push(role);
    }
    if (action) {
      filters.push(`LOWER(action) LIKE LOWER($${paramIndex++})`);
      params.push(`%${action}%`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

    // Ambil total count
    const countQuery = `SELECT COUNT(*) AS total FROM logs ${whereClause}`;
    const totalResult = await db.query(countQuery, params);
    const total = Number(totalResult.rows[0].total);

    // Ambil data log dengan pagination
    const query = `
      SELECT id, username, role, action, target, timestamp
      FROM logs
      ${whereClause}
      ORDER BY id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const result = await db.query(query, params);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      logs: result.rows,
    });
  } catch (err) {
    console.error("❌ Error GET /logs:", err.message);
    res.status(500).json({ error: "Gagal memuat data log aktivitas" });
  }
});

/**
 * ==========================================================
 * DELETE /api/logs/clear
 * Hapus semua log (super only)
 * ==========================================================
 */
router.delete("/clear", requireRole("super"), async (req, res) => {
  try {
    await db.query("DELETE FROM logs");
    await db.query("ALTER SEQUENCE logs_id_seq RESTART WITH 1");
    res.json({ message: "🧹 Semua log berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error DELETE /logs/clear:", err.message);
    res.status(500).json({ error: "Gagal menghapus log" });
  }
});

module.exports = router;
