// scripts/init-db.js
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "..", "data", "database.sqlite");

// pastikan folder data ada
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// buka koneksi database
const db = new Database(dbPath);
console.log("🗄️ Connected to database:", dbPath);

// ======= CREATE TABLE USERS =======
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'staff'
  )
`).run();

// ======= CREATE TABLE TOURS =======
db.prepare(`
  CREATE TABLE IF NOT EXISTS tours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    location TEXT,
    price REAL,
    start_date TEXT,
    end_date TEXT
  )
`).run();

// ======= CREATE TABLE SALES =======
db.prepare(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tour_id INTEGER,
    customer_name TEXT,
    amount REAL,
    date TEXT,
    FOREIGN KEY (tour_id) REFERENCES tours(id)
  )
`).run();

// ======= SEED ADMIN USER =======
const adminUser = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");

if (!adminUser) {
  const hashed = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", hashed, "admin");
  console.log("✅ Default admin user created → username: admin | password: admin123");
} else {
  console.log("ℹ️ Admin user already exists, skipping seed.");
}

db.close();
console.log("✅ Database initialization complete.");
