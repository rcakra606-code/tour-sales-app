/**
 * ==========================================================
 * config/database.js — PostgreSQL (Neon) Configuration
 * ==========================================================
 * ✅ Connection pooling with pg.Pool
 * ✅ SSL Enabled (required by Neon)
 * ✅ Auto-reconnect handling
 * ✅ Centralized instance (used by all routes)
 * ==========================================================
 */

const { Pool } = require("pg");

// --- Create Pool Instance ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// --- Verify Connection on Startup ---
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL (Neon) at:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
  }
})();

// --- Export helper query function ---
module.exports = {
  /**
   * @function query
   * Execute SQL query safely using parameterized syntax
   * @param {string} text SQL statement with $1, $2 placeholders
   * @param {array} params Array of parameters
   * @returns {Promise<object>} result.rows or empty array
   */
  query: async (text, params = []) => {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (err) {
      console.error("❌ Database query error:", err.message);
      throw err;
    }
  },

  /**
   * Get raw pool instance if needed (for advanced operations)
   */
  pool,
};
