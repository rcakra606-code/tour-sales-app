// ======================================
// ✅ Script inisialisasi database SQLite
// ======================================
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dbDir, "database.sqlite");

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new sqlite3.Database(dbPath);

// Jalankan pembuatan tabel jika belum ada
db.serialize(() => {
  console.log("🚀 Membuat tabel jika belum ada...");

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'staff'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tour_id INTEGER,
      amount REAL,
      date TEXT,
      FOREIGN KEY(tour_id) REFERENCES tours(id)
    )
  `);

  // Tambahkan user admin default jika belum ada
  db.get(`SELECT * FROM users WHERE username = 'admin'`, (err, row) => {
    if (!row) {
      const bcrypt = require("bcryptjs");
      const hashed = bcrypt.hashSync("admin123", 10);
      db.run(
        `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        ["admin", hashed, "admin"],
        (err2) => {
          if (err2) console.error("❌ Gagal menambah admin:", err2.message);
          else console.log("✅ User admin dibuat (username: admin, password: admin123)");
        }
      );
    } else {
      console.log("ℹ️ User admin sudah ada, lewati inisialisasi.");
    }
  });
});

db.close(() => console.log("✅ Database siap:", dbPath));
