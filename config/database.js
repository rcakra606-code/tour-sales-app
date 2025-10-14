// config/database.js
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Pastikan folder data ada
const dataDir = path.resolve(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Gunakan file travel.db di dalam folder data
const dbPath = path.join(dataDir, "travel.db");
const db = new Database(dbPath, { verbose: console.log });

// Buat tabel dasar jika belum ada
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'staff'
);

CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  price REAL,
  start_date TEXT,
  end_date TEXT
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tour_id INTEGER,
  user_id INTEGER,
  amount REAL,
  date TEXT,
  FOREIGN KEY (tour_id) REFERENCES tours(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);

module.exports = db;
