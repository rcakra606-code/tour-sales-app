/**
 * ✅ Database Initialization (Better-SQLite3)
 */
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const { logger } = require("./logger");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dbPath = path.join(dataDir, "database.sqlite");
const db = new Database(dbPath);

// === CREATE TABLES ===
try {
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
      tourCode TEXT,
      leadPassenger TEXT,
      region TEXT,
      paxCount INTEGER DEFAULT 0,
      tourPrice REAL DEFAULT 0,
      departureStatus TEXT,
      registrationDate TEXT DEFAULT CURRENT_TIMESTAMP,
      staff TEXT
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transactionDate TEXT DEFAULT CURRENT_TIMESTAMP,
      invoiceNumber TEXT,
      salesAmount REAL DEFAULT 0,
      profitAmount REAL DEFAULT 0,
      staff TEXT,
      tourId INTEGER,
      FOREIGN KEY (tourId) REFERENCES tours(id)
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `).run();

  logger.info(`✅ Database connected at: ${dbPath}`);

  // === Create Default Admin ===
  const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
  if (!adminExists) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.prepare(
      `INSERT INTO users (name, username, password, role, type) VALUES (?,?,?,?,?)`
    ).run("Administrator", "admin", hash, "admin", "admin");
    logger.info("👤 Default admin user created: admin / admin123");
  } else {
    logger.info("✅ Admin account already exists");
  }
} catch (err) {
  logger.error("❌ Database initialization error: " + err.message);
  process.exit(1);
}

module.exports = db;
