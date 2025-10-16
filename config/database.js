// config/database.js
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../data/database.sqlite");
const backupDir = path.join(__dirname, "../backups");

// === 1️⃣ Auto restore jika file DB rusak / hilang ===
if (!fs.existsSync(dbPath)) {
  console.warn("⚠️ Database file missing. Trying to restore from latest backup...");

  if (fs.existsSync(backupDir)) {
    const backups = fs.readdirSync(backupDir).filter(f => f.endsWith(".sqlite"));
    if (backups.length > 0) {
      const latest = backups.sort().reverse()[0];
      const latestBackup = path.join(backupDir, latest);
      try {
        fs.copyFileSync(latestBackup, dbPath);
        console.log(`✅ Restored database from backup: ${latest}`);
      } catch (err) {
        console.error("❌ Failed to restore from backup:", err.message);
      }
    } else {
      console.warn("⚠️ No backup files found, creating new database...");
    }
  } else {
    console.warn("⚠️ No backup folder found, creating new database...");
  }
}

// === 2️⃣ Buat koneksi database utama ===
const db = new Database(dbPath);
console.log("✅ Database connected at:", dbPath);

// === 3️⃣ Pastikan tabel utama ada ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'basic',
    type TEXT DEFAULT 'basic'
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registrationDate TEXT,
    leadPassenger TEXT,
    tourCode TEXT,
    region TEXT,
    paxCount INTEGER,
    staff TEXT,
    tourPrice REAL,
    departureStatus TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transactionDate TEXT,
    invoiceNumber TEXT,
    salesAmount REAL,
    profitAmount REAL,
    staff TEXT
  )
  CREATE TABLE IF NOT EXISTS regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    code TEXT,
    description TEXT
  )
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fileName TEXT NOT NULL,
    originalName TEXT,
    mimeType TEXT,
    size INTEGER,
    uploadedBy TEXT,
    uploadedAt TEXT DEFAULT (datetime('now')),
    description TEXT
  )
`).run();

module.exports = db;
