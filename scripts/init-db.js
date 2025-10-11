const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "../data/database.sqlite");
const db = new sqlite3.Database(dbPath);

const defaultPassword = bcrypt.hashSync("admin123", 10);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'admin'
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO users (username, password, role)
    VALUES ('admin', ?, 'admin')
  `, [defaultPassword]);

  console.log("✅ Database siap & admin default tersedia (admin/admin123)");
});

db.close();
