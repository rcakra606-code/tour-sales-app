const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");

async function initDB() {
  const dbPath = path.join(__dirname, "../data/database.sqlite");
  const db = new sqlite3.Database(dbPath);

  console.log("🔧 Initializing SQLite database...");

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'admin'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      date TEXT,
      status TEXT,
      participants INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_date TEXT,
      invoice_number TEXT,
      sales_amount REAL,
      profit_amount REAL,
      staff_name TEXT
    )`);

    // ✅ Tambahkan user admin default jika belum ada
    const defaultPassword = bcrypt.hashSync("admin123", 10);
    db.run(
      `INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`,
      ["admin", defaultPassword, "admin"]
    );
  });

  db.close(() => console.log("✅ Database ready with default admin user"));
}

module.exports = initDB;
