const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../data/database.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Gagal koneksi ke database:", err.message);
  } else {
    console.log("✅ Terhubung ke SQLite database:", dbPath);
  }
});

module.exports = db;

// Buat tabel jika belum ada
db.serialize(() => {
  // Tabel users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabel sales
  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      price REAL DEFAULT 0,
      total REAL GENERATED ALWAYS AS (quantity * price) VIRTUAL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id)
    )
  `);

  // Tabel tours
  db.run(`
    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tour_name TEXT NOT NULL,
      location TEXT,
      date TEXT,
      price REAL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id)
    )
  `);

  // Tambahkan admin default jika belum ada
  db.get(`SELECT COUNT(*) AS count FROM users WHERE username = 'admin'`, (err, row) => {
    if (!row || row.count === 0) {
      const bcrypt = require("bcryptjs");
      const hashed = bcrypt.hashSync("admin123", 10);
      db.run(
        `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        ["admin", hashed, "admin"],
        (err2) => {
          if (err2) console.error("⚠️ Failed to insert default admin:", err2.message);
          else console.log("✅ Default admin user created (admin / admin123)");
        }
      );
    }
  });
});

module.exports = db;
