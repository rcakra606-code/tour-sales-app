// config/database.js
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const logger = require("./logger");

const dbPath = path.join(__dirname, "../data/database.sqlite");
const backupDir = path.join(__dirname, "../backups");

// === Restore otomatis kalau DB hilang ===
if (!fs.existsSync(dbPath)) {
  logger.warn("⚠️ Database file missing. Trying to restore from latest backup...");
  if (fs.existsSync(backupDir)) {
    const backups = fs.readdirSync(backupDir).filter(f => f.endsWith(".sqlite"));
    if (backups.length > 0) {
      const latest = backups.sort().reverse()[0];
      fs.copyFileSync(path.join(backupDir, latest), dbPath);
      logger.info(`✅ Restored database from backup: ${latest}`);
    } else {
      logger.warn("⚠️ No backup found, creating new database...");
    }
  }
}

const db = new Database(dbPath);
logger.info(`✅ Database connected at: ${dbPath}`);

// === Pastikan tabel utama ada ===
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
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS regions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    code TEXT,
    description TEXT
  )
`).run();

module.exports = db;
