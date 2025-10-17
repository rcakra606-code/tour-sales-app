/**
 * ✅ Database Initialization (Better-SQLite3)
 * Handles schema creation, seeding, and connection.
 */
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const { logger } = require("../utils/logger");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "database.sqlite");
const db = new Database(dbPath);

try {
  // === CREATE TABLES ===
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'basic',
      type TEXT DEFAULT 'basic',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tourCode TEXT UNIQUE,
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
      invoiceNumber TEXT UNIQUE,
      salesAmount REAL DEFAULT 0,
      profitAmount REAL DEFAULT 0,
      staff TEXT,
      tourId INTEGER,
      FOREIGN KEY (tourId) REFERENCES tours(id) ON DELETE CASCADE
    )
  `).run();

  db.prepare(`CREATE INDEX IF NOT EXISTS idx_sales_tourId ON sales(tourId)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_tours_region ON tours(region)`).run();
  db.prepare(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`).run();

  logger.info(`✅ Database initialized successfully at: ${dbPath}`);

  // === Default admin ===
  const admin = db.prepare("SELECT id FROM users WHERE username = ?").get("admin");
  if (!admin) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.prepare(`
      INSERT INTO users (name, username, password, role, type)
      VALUES (?, ?, ?, ?, ?)
    `).run("Administrator", "admin", hash, "admin", "admin");
    logger.info("👤 Default admin user created → username: admin / password: admin123");
  }

  // === Default regions ===
  const regionCount = db.prepare("SELECT COUNT(*) AS c FROM regions").get().c;
  if (regionCount === 0) {
    const defaultRegions = [
      { name: "Asia", description: "Asian destinations" },
      { name: "Europe", description: "European destinations" },
      { name: "America", description: "American destinations" },
    ];
    const insert = db.prepare(`INSERT INTO regions (name, description) VALUES (?, ?)`);
    const tx = db.transaction(() => {
      defaultRegions.forEach(r => insert.run(r.name, r.description));
    });
    tx();
    logger.info("🌍 Default regions inserted");
  }

} catch (err) {
  logger.error("❌ Database initialization failed: " + err.message);
  process.exit(1);
}

module.exports = db;
