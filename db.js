const Database = require("better-sqlite3");
const path = require("path");

let db;
function getDB() {
  if (!db) db = new Database(path.join(__dirname, "data.db"));
  return db;
}

function initDB() {
  const db = getDB();

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

  db.prepare(`
    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registration_date TEXT,
      tour_code TEXT,
      lead_passenger TEXT,
      pax_count INTEGER,
      region TEXT,
      tour_price REAL,
      staff_username TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `).run();

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

  db.prepare(`
    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )
  `).run();

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

  console.log("✅ Database siap digunakan.");
}

module.exports = { getDB, initDB };
