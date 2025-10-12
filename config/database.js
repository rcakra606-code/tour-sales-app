const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

// Pastikan folder data ada
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Lokasi database
const dbPath = path.join(dataDir, "database.sqlite");
const db = new Database(dbPath);
console.log(`📦 Database loaded from ${dbPath}`);

// ========================
// ✅ INIT TABLES
// ========================
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'staff'
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price REAL,
    date TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tour_id INTEGER,
    customer_name TEXT,
    amount REAL,
    sale_date TEXT,
    created_by TEXT,
    FOREIGN KEY (tour_id) REFERENCES tours (id)
  )
`).run();

// ========================
// ✅ DEFAULT ADMIN ACCOUNT
// ========================
const adminUser = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminUser) {
  const hashed = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", hashed, "admin");
  console.log("✅ Default admin account created: admin / admin123");
} else {
  console.log("ℹ️ Admin account already exists, skipping creation.");
}

module.exports = db;
