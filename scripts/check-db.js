// scripts/check-db.js
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "../data/database.sqlite");
const db = new Database(dbPath);

const tables = ["users", "tours", "sales", "regions"];
let missing = [];

for (const t of tables) {
  const row = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(t);
  if (!row) missing.push(t);
}

if (missing.length > 0) {
  console.log("⚠️  Missing tables detected:", missing.join(", "));
  console.log("Creating missing tables...");

  if (missing.includes("users")) {
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
  }

  if (missing.includes("tours")) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS tours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registrationDate TEXT,
        leadPassenger TEXT,
        tourCode TEXT,
        region TEXT,
        paxCount INTEGER,
        staff TEXT,
        tourPrice REAL,
        departureStatus TEXT
      )
    `).run();
  }

  if (missing.includes("sales")) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transactionDate TEXT,
        invoiceNumber TEXT,
        salesAmount REAL,
        profitAmount REAL,
        staff TEXT
      )
    `).run();
  }

  if (missing.includes("regions")) {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS regions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        code TEXT,
        description TEXT
      )
    `).run();
  }

  console.log("✅ All missing tables have been created successfully.");
} else {
  console.log("✅ All required tables already exist.");
}

db.close();
