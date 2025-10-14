const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(__dirname, "../data/travel.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Database connection error:", err.message);
  else console.log(`✅ Database connected: ${dbPath}`);
});

// === INIT TABLES ===
db.serialize(() => {
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
      location TEXT,
      price REAL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tour_id INTEGER,
      customer_name TEXT,
      total_price REAL,
      sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tour_id) REFERENCES tours(id)
    )
  `);

  // === CEK ADMIN DEFAULT ===
  db.get("SELECT * FROM users WHERE username = 'admin'", async (err, row) => {
    if (err) {
      console.error("❌ Gagal memeriksa admin:", err.message);
      return;
    }

    if (!row) {
      const defaultPassword = "admin123";
      const hashed = await bcrypt.hash(defaultPassword, 10);

      db.run(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        ["admin", hashed, "admin"],
        (err) => {
          if (err) console.error("❌ Gagal membuat admin default:", err.message);
          else console.log("🧩 Admin default dibuat → username: admin | password: admin123");
        }
      );
    } else {
      console.log("✅ Admin sudah ada, skip pembuatan default");
    }
  });
});

module.exports = db;
