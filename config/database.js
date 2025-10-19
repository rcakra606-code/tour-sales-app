/**
 * ==========================================================
 * config/database.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Hybrid Database Connection (PostgreSQL + SQLite fallback)
 * ✅ Neon PostgreSQL untuk Production
 * ✅ SQLite (travel.db) untuk Local Dev
 * ✅ Logging dan auto-reconnect
 * ==========================================================
 */

const { Pool } = require("pg");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const logger = require("./logger");
require("dotenv").config();

let db;
const isUsingPostgres = !!process.env.DATABASE_URL;

// ============================================================
// 🔹 PostgreSQL (Neon) Connection
// ============================================================
async function connectPostgres() {
  try {
    logger.info("⏳ Menghubungkan ke PostgreSQL (Neon)...");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();

    logger.info("✅ PostgreSQL (Neon) Connected Successfully");

    // Wrapper for pg like sqlite-style API
    return {
      run: async (sql, params = []) => {
        await pool.query(sql, params);
      },
      get: async (sql, params = []) => {
        const res = await pool.query(sql, params);
        return res.rows[0];
      },
      all: async (sql, params = []) => {
        const res = await pool.query(sql, params);
        return res.rows;
      },
      exec: async (sql) => {
        await pool.query(sql);
      },
      pool,
    };
  } catch (err) {
    logger.error(`❌ Gagal menghubungkan ke PostgreSQL: ${err.message}`);
    throw err;
  }
}

// ============================================================
// 🔹 SQLite Fallback Connection
// ============================================================
async function connectSQLite() {
  try {
    logger.warn("⚠️ Neon tidak tersedia — menggunakan SQLite (travel.db)");
    const sqlite = await open({
      filename: "./data/travel.db",
      driver: sqlite3.Database,
    });
    logger.info("✅ SQLite connected (local mode)");
    return sqlite;
  } catch (err) {
    logger.error("❌ Gagal menghubungkan SQLite:", err);
    throw err;
  }
}

// ============================================================
// 🚀 Initialize Connection
// ============================================================
async function initDatabase() {
  try {
    if (isUsingPostgres && process.env.DATABASE_URL) {
      db = await connectPostgres();
    } else {
      db = await connectSQLite();
    }

    // Pastikan tabel-tabel utama ada
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'basic',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        registrationDate TEXT,
        leadPassenger TEXT,
        allPassengers TEXT,
        tourCode TEXT,
        region TEXT,
        departureDate TEXT,
        bookingCode TEXT,
        tourPrice REAL,
        discountRemarks TEXT,
        paymentProof TEXT,
        documentReceived TEXT,
        visaProcessStart TEXT,
        visaProcessEnd TEXT,
        documentRemarks TEXT,
        staff TEXT,
        salesAmount REAL,
        profitAmount REAL,
        departureStatus TEXT
      );

      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        transaction_date TEXT,
        invoice_number TEXT,
        staff_name TEXT,
        sales_amount REAL,
        profit_amount REAL,
        discount_amount REAL
      );

      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        receive_date TEXT,
        guest_name TEXT,
        booking_code TEXT,
        tour_code TEXT,
        document_remarks TEXT
      );

      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        action TEXT,
        username TEXT,
        role TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    logger.info("✅ Struktur database diverifikasi & siap digunakan");
  } catch (err) {
    logger.error("❌ Database initialization error:", err);
    throw err;
  }
}

module.exports = {
  initDatabase,
  getDB: () => db,
};
