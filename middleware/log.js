/**
 * ==========================================================
 * middleware/log.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ Logging terpusat ke tabel `logs` di Neon PostgreSQL
 * ✅ Dipanggil di semua aksi penting (CRUD, login, error)
 * ✅ Aman dari SQL injection (parameterized query)
 * ==========================================================
 */

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * @function logAction
 * Menyimpan log aktivitas user ke tabel `logs`
 *
 * @param {object} user - data user aktif (req.user)
 * @param {string} action - aksi yang dilakukan (misal: "Menambahkan Tour")
 * @param {string} target - target aksi (misal: "Tour ID: 45" atau "username: admin")
 */
async function logAction(user, action, target = "-") {
  try {
    if (!user || !user.username) return;

    const sql = `
      INSERT INTO logs (username, role, action, target)
      VALUES ($1, $2, $3, $4)
    `;
    const params = [user.username, user.type || "unknown", action, target];

    await pool.query(sql, params);
  } catch (err) {
    console.error("⚠️ Gagal mencatat log aktivitas:", err.message);
  }
}

module.exports = { logAction };
