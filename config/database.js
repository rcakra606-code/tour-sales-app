/**
 * config/database.js
 * PostgreSQL (Neon) pool with retry + verbose diagnostics
 */

const { Pool } = require("pg");

const CONNECTION_STRING = process.env.DATABASE_URL || process.env.DATABASE_URI || process.env.PG_URI || null;

if (!CONNECTION_STRING) {
  console.error("❌ FATAL: environment variable DATABASE_URL (or DATABASE_URI/PG_URI) is not set.");
  console.error("Please set DATABASE_URL to Neon connection string, e.g.:");
  console.error("postgresql://neondb_owner:npg_YM8HVPWg5fnJ@ep-young-moon-a1lbsq3i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
  // do not exit synchronously if you want process to continue; but safe to exit to avoid random errors
  // process.exit(1);
}

const pool = new Pool({
  connectionString: CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
  // optional tuning:
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

async function verifyConnection(retries = 5, delayMs = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await pool.query("SELECT NOW()");
      console.log("✅ Connected to PostgreSQL (Neon) — server time:", r.rows[0].now);
      return true;
    } catch (err) {
      console.error(`❌ Failed to connect to PostgreSQL (attempt ${i + 1}/${retries}):`, err.message || err);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delayMs}ms...`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        console.error("❌ All connection attempts failed. See message above.");
        return false;
      }
    }
  }
}

// wrapper query function with better error message
async function query(text, params = []) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error("❌ Database query error:", err.message || err);
    throw err;
  }
}

module.exports = { pool, query, verifyConnection };
