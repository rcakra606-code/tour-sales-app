/**
 * ==========================================================
 * 📁 config/database.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Modul koneksi utama ke NeonDB PostgreSQL:
 * - Auto reconnect
 * - SSL aktif (Render & Neon)
 * - Integrasi logger
 * ==========================================================
 */

import pkg from "pg";
import dotenv from "dotenv";
import logger, { logInfo, logError } from "./logger.js";

dotenv.config();
const { Pool } = pkg;

// Pastikan URL database tersedia
if (!process.env.DATABASE_URL) {
  logError("❌ DATABASE_URL belum diset di .env");
  throw new Error("DATABASE_URL tidak ditemukan di environment variable.");
}

// Konfigurasi koneksi NeonDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10, // jumlah maksimum koneksi pool
  idleTimeoutMillis: 30000, // tutup koneksi idle setelah 30 detik
  connectionTimeoutMillis: 10000, // timeout 10 detik untuk koneksi baru
});

// 🔄 Fungsi cek koneksi awal
export const verifyConnection = async () => {
  try {
    logInfo("🔌 Menguji koneksi ke NeonDB...");
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    logInfo(`✅ Koneksi ke NeonDB berhasil (${result.rows[0].now})`);
  } catch (err) {
    logError(`❌ Gagal koneksi ke NeonDB: ${err.message}`);
    throw err;
  }
};

// 🧩 Helper untuk query global
export const query = async (text, params) => {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logInfo(`📦 Query selesai dalam ${duration}ms: ${text}`);
    return result;
  } catch (err) {
    logError(`❌ Query error: ${err.message} | SQL: ${text}`);
    throw err;
  }
};

// 🧱 Export pool utama
export default pool;