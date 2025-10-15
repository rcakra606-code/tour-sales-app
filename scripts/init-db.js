// scripts/init-db.js
const db = require("../config/database");
const bcrypt = require("bcryptjs");

console.log("🧩 Initializing database tables...");

try {
  // === USERS TABLE ===
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'basic',
      type TEXT DEFAULT 'basic'
    )
  `).run();
  console.log("✅ Table 'users' ready");

  // === TOURS TABLE ===
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registrationDate TEXT,
      leadPassenger TEXT,
      tourCode TEXT,
      region TEXT,
      paxCount INTEGER,
      tourPrice REAL,
      departureStatus TEXT,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `).run();
  console.log("✅ Table 'tours' ready");

  // === SALES TABLE ===
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transactionDate TEXT,
      invoiceNumber TEXT,
      salesAmount REAL,
      profitAmount REAL,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `).run();
  console.log("✅ Table 'sales' ready");

  // === DOCUMENTS TABLE ===
  db.prepare(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      docNumber TEXT NOT NULL,
      tourCode TEXT,
      sentDate TEXT,
      status TEXT,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `).run();
  console.log("✅ Table 'documents' ready");

  // === DEFAULT ADMIN ACCOUNT ===
  const admin = db.prepare("SELECT id FROM users WHERE username = ?").get("admin");
  if (!admin) {
    const hashed = bcrypt.hashSync("admin123", 10);
    db.prepare(`
      INSERT INTO users (name, username, email, password, role, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("Administrator", "admin", "admin@example.com", hashed, "super", "super");
    console.log("⚙️ Default admin user created (admin / admin123)");
  } else {
    console.log("✅ Default admin already exists");
  }

  console.log("🎉 Database initialization completed successfully!");
} catch (err) {
  console.error("❌ Database initialization failed:", err.message);
}
