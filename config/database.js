// =====================================
// ✅ SQLite Database Config (Auto Setup)
// =====================================
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Tentukan lokasi file database (di folder "data")
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "app.db");
const db = new sqlite3.Database(dbPath);

console.log("📦 Database loaded:", dbPath);

// =====================================
// ✅ Inisialisasi tabel (jika belum ada)
// =====================================
db.serialize(() => {
  // --- USERS ---
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // --- TOURS ---
  db.run(
    `CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      destination TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  // --- SALES ---
  db.run(
    `CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tour_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tour_id) REFERENCES tours (id)
    )`
  );

  // --- Default admin user ---
  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (!row) {
      const bcrypt = require("bcryptjs");
      const hashed = bcrypt.hashSync("admin123", 10);
      db.run(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        ["admin", hashed, "admin"],
        (insertErr) => {
          if (insertErr) console.error("⚠️ Gagal menambah admin default:", insertErr);
          else console.log("✅ Default admin created (admin / admin123)");
        }
      );
    }
  });
});

module.exports = db;
