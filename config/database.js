// config/database.js
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// ================================
// ✅ Pastikan direktori database ada
// ================================
const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ================================
// ✅ Inisialisasi koneksi database
// ================================
const DB_PATH = path.join(DATA_DIR, "database.sqlite");
let db;

try {
  db = new Database(DB_PATH, { verbose: console.log });
  console.log("✅ Connected to SQLite database at:", DB_PATH);
} catch (err) {
  console.error("❌ Failed to connect to SQLite:", err.message);
  process.exit(1);
}

// ================================
// ✅ Pastikan tabel utama ada
// ================================
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'staff'
    );

    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tour_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT,
      FOREIGN KEY (tour_id) REFERENCES tours(id)
    );
  `);
  console.log("✅ Database tables verified");
} catch (err) {
  console.error("❌ Database initialization failed:", err.message);
}

// ================================
// ✅ Export database instance
// ================================
module.exports = db;
