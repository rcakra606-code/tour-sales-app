/**
 * db.js — Travel Dashboard Enterprise v3.3
 * SQLite database initialization
 */

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
let db;

function getDB() {
  if (!db) {
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    db = new Database(path.join(dataDir, "travel.db"));
  }
  return db;
}

function initDB() {
  const db = getDB();

  // USERS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      type TEXT DEFAULT 'basic',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  // TOURS (per package)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      departureStatus TEXT DEFAULT 'PENDING',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  // SALES (per invoice)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_date TEXT,
      invoice_number TEXT,
      sales_amount REAL,
      profit_amount REAL,
      discount_amount REAL,
      staff_username TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  // DOCUMENTS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_names TEXT,
      invoice_number TEXT,
      process_type TEXT,
      document_status TEXT,
      visa_status TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

  // REGIONS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )
  `).run();

  // LOGS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      role TEXT,
      action TEXT,
      target TEXT,
      timestamp TEXT DEFAULT (datetime('now'))
    )
  `).run();

  console.log("✅ Database initialized (Travel Dashboard v3.3)");
}

module.exports = { getDB, initDB };
