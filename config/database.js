// config/database.js
const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");

// Pastikan folder data/ ada
const dbDir = path.join(__dirname, "../data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Buat koneksi ke database SQLite
const dbPath = path.join(dbDir, "database.sqlite");
const db = new Database(dbPath, { verbose: console.log });

// Log koneksi berhasil
console.log(`✅ Connected to SQLite database: ${dbPath}`);

// Inisialisasi tabel jika belum ada
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'staff'
);

CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  price REAL,
  date TEXT
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tour_id INTEGER,
  customer_name TEXT,
  total_amount REAL,
  sale_date TEXT,
  FOREIGN KEY (tour_id) REFERENCES tours (id)
);
`);

module.exports = db;
