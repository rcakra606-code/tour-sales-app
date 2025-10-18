/**
 * ==========================================================
 * config/logger.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ Simpan log aktivitas ke Neon PostgreSQL
 * ✅ Auto-create table "logs" bila belum ada
 * ✅ Digunakan oleh middleware/log.js dan controllers
 * ✅ Aman dari SQL injection (parameterized queries)
 * ==========================================================
 */

const { Pool } = require("pg");

// Neon PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Auto-check log table
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        username TEXT,
        role TEXT,
        action TEXT,
        target TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("🧾 Logger initialized — PostgreSQL table 'logs' ready");
  } catch (err) {
    console.error("❌ Failed to initialize logs table:", err.message);
  }
})();

/**
 * ==========================================================
 * logEvent()
 * Mencatat aktivitas user ke tabel logs
 * ==========================================================
 * @param {string} username - nama user
 * @param {string} role - tipe user (super/semi/basic)
 * @param {string} action - aksi yang dilakukan
 * @param {string} target - target atau objek aksi
 * ==========================================================
 */
async function logEvent(username, role, action, target) {
  try {
    await pool.query(
      "INSERT INTO logs (username, role, action, target) VALUES ($1, $2, $3, $4)",
      [username, role, action, target]
    );
  } catch (err) {
    console.error("❌ Gagal mencatat log:", err.message);
  }
}

module.exports = { logEvent, pool };
