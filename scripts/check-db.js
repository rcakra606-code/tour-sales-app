/**
 * ==========================================================
 * 📁 scripts/check-db.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Mengecek koneksi ke NeonDB + status tabel + jumlah record
 * ==========================================================
 */

import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const tables = [
  "users",
  "sales",
  "tours",
  "documents",
  "targets"
];

async function checkDatabase() {
  console.log("🔍 Mengecek koneksi database dan tabel...");
  try {
    const res = await pool.query("SELECT NOW() AS connected_at;");
    console.log("✅ Tersambung ke NeonDB pada:", res.rows[0].connected_at);

    for (const table of tables) {
      try {
        const count = await pool.query(`SELECT COUNT(*) FROM ${table};`);
        console.log(`📦 Tabel '${table}': ${count.rows[0].count} record`);
      } catch (err) {
        console.log(`⚠️  Tabel '${table}' belum tersedia (${err.message})`);
      }
    }

    console.log("✅ Pemeriksaan database selesai.\n");
  } catch (err) {
    console.error("❌ Tidak dapat terhubung ke database:", err.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();