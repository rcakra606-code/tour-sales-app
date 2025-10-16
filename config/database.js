/**
 * ✅ DATABASE CONFIGURATION
 * Menggunakan better-sqlite3 untuk database lokal yang cepat dan ringan.
 */

const path = require("path");
const Database = require("better-sqlite3");
const logger = require("./logger");

const dbPath = path.join(__dirname, "..", "data", "database.sqlite");

// === Inisialisasi Database ===
const db = new Database(dbPath);
logger.info(`✅ Database connected at: ${dbPath}`);

// =====================================
// ✅ CREATE TABLES
// =====================================

// === USERS ===
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

// === TOURS ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registrationDate TEXT DEFAULT (DATE('now')),
    leadPassenger TEXT,
    tourCode TEXT,
    region TEXT,
    paxCount INTEGER DEFAULT 0,
    staff TEXT,
    tourPrice REAL DEFAULT 0,
    departureStatus TEXT DEFAULT 'Pending'
  )
`).run();

// === SALES ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transactionDate TEXT DEFAULT (DATE('now')),
    invoiceNumber TEXT,
    salesAmount REAL DEFAULT 0,
    profitAmount REAL DEFAULT 0,
    staff TEXT
  )
`).run();

// =====================================
// ✅ INDEXING (opsional, agar query cepat)
// =====================================
db.prepare(`CREATE INDEX IF NOT EXISTS idx_tours_region ON tours(region)`).run();
db.prepare(`CREATE INDEX IF NOT EXISTS idx_sales_staff ON sales(staff)`).run();
db.prepare(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`).run();

// =====================================
// ✅ TEST INITIAL DATA (jika kosong)
// =====================================
const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
if (userCount === 0) {
  const bcrypt = require("bcryptjs");
  const hashed = bcrypt.hashSync("admin123", 10);
  db.prepare(`
    INSERT INTO users (name, username, email, password, role, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run("Administrator", "admin", "admin@example.com", hashed, "super", "super");
  logger.info("👤 Default admin user created: admin / admin123");
}

// =====================================
// ✅ Export Database Connection
// =====================================
module.exports = db;
