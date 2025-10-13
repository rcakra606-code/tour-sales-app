// config/database.js
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// ======================================================
// 📦 Tentukan lokasi file database
// ======================================================
const DB_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DB_DIR, "travel.db");

// Pastikan folder data ada
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log("📁 Folder 'data' dibuat otomatis.");
}

// ======================================================
// 🧠 Inisialisasi koneksi database
// ======================================================
const db = new Database(DB_PATH);
console.log("✅ Database connected:", DB_PATH);

// ======================================================
// 🧱 Buat tabel jika belum ada
// ======================================================
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  price REAL,
  date TEXT,
  location TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tour_id INTEGER,
  customer_name TEXT,
  quantity INTEGER,
  total_price REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tour_id) REFERENCES tours(id)
);
`);

// ======================================================
// 👑 Pastikan ada akun admin default
// ======================================================
const bcrypt = require("bcryptjs");

try {
  const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
  if (!adminExists) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", hash, "admin");
    console.log("🧩 Admin default dibuat → username: admin | password: admin123");
  } else {
    console.log("✅ Admin default sudah ada.");
  }
} catch (err) {
  console.error("❌ Gagal memeriksa/membuat admin:", err.message);
}

// ======================================================
// 🚀 Export koneksi database
// ======================================================
module.exports = db;
