/**
 * ==========================================================
 * scripts/initDatabase.js
 * Travel Dashboard Enterprise — Inisialisasi Database
 * ==========================================================
 * ✅ Membuat semua tabel utama jika belum ada
 * ✅ Menambahkan tabel baru: targets
 * ==========================================================
 */

const { getDB } = require("../config/database");
const logger = require("../config/logger");

async function createTables() {
  const db = getDB();

  try {
    logger.info("🧱 Inisialisasi struktur database...");

    // ================================================
    // 1️⃣ Tabel Users
    // ================================================
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'basic',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ================================================
    // 2️⃣ Tabel Sales
    // ================================================
    await db.run(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_name TEXT,
        transaction_date TEXT,
        sales_amount REAL DEFAULT 0,
        profit_amount REAL DEFAULT 0
      )
    `);

    // ================================================
    // 3️⃣ Tabel Tours
    // ================================================
    await db.run(`
      CREATE TABLE IF NOT EXISTS tours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff TEXT,
        registrationDate TEXT,
        tourCode TEXT,
        region TEXT,
        departureDate TEXT,
        bookingCode TEXT,
        tourPrice REAL DEFAULT 0,
        discountRemarks TEXT,
        paymentProof TEXT,
        documentReceived TEXT,
        visaProcessStart TEXT,
        visaProcessEnd TEXT,
        documentRemarks TEXT,
        salesAmount REAL DEFAULT 0,
        profitAmount REAL DEFAULT 0,
        departureStatus TEXT DEFAULT 'PENDING'
      )
    `);

    // ================================================
    // 4️⃣ Tabel Targets (baru)
    // ================================================
    await db.run(`
      CREATE TABLE IF NOT EXISTS targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_name TEXT NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        target_sales REAL DEFAULT 0,
        target_profit REAL DEFAULT 0,
        target_tour INTEGER DEFAULT 0,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(staff_name, month, year)
      )
    `);

    logger.info("✅ Semua tabel sudah siap digunakan.");
  } catch (err) {
    logger.error("❌ Gagal inisialisasi database:", err);
    throw err;
  }
}

async function initDatabase() {
  await createTables();
}

module.exports = { initDatabase };