// =====================================
// ✅ Database Initialization Script
// =====================================
const db = require("../config/db");
const bcrypt = require("bcryptjs");

(async function initDatabase() {
  console.log("🚀 Initializing database...");

  // USERS TABLE
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'staff',
      name TEXT
    )
  `);

  // TOURS TABLE
  await db.run(`
    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      participants INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending'
    )
  `);

  // SALES TABLE
  await db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT
    )
  `);

  // CEK ADMIN EXIST
  db.get(`SELECT * FROM users WHERE username = ?`, ["admin"], async (err, user) => {
    if (err) return console.error("❌ Query error:", err.message);
    if (user) {
      console.log("✅ Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    db.run(
      `INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)`,
      ["admin", hashedPassword, "admin", "Administrator"],
      (err) => {
        if (err) console.error("❌ Failed to create admin:", err.message);
        else console.log("✅ Default admin created (username: admin, password: admin123)");
      }
    );
  });
})();
