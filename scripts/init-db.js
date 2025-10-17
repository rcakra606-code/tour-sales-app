// scripts/init-db.js
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "database.sqlite");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_FILE);

db.exec("PRAGMA journal_mode = WAL;");

// === TABEL ===
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT,
  email TEXT,
  type TEXT DEFAULT 'basic',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  token TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registrationDate TEXT,
  leadPassenger TEXT,
  allPassengers TEXT,
  paxCount INTEGER,
  tourCode TEXT,
  region TEXT,
  departureDate TEXT,
  bookingCode TEXT,
  tourPrice INTEGER,
  discountRemarks TEXT,
  paymentProof TEXT,
  documentReceived TEXT,
  visaProcessStart TEXT,
  visaProcessEnd TEXT,
  documentRemarks TEXT,
  staff TEXT,
  salesAmount INTEGER,
  profitAmount INTEGER,
  departureStatus TEXT
);
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transactionDate TEXT,
  invoiceNumber TEXT,
  salesAmount INTEGER,
  profitAmount INTEGER,
  staff TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  documentReceiveDate TEXT,
  guestNames TEXT,
  bookingCodeDMS TEXT,
  tourCode TEXT,
  documentRemarks TEXT,
  documentStatus TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

console.log("✅ Database schema created.");

// === SEED ADMIN ===
const admin = db.prepare("SELECT username FROM users WHERE username = ?").get("admin");
if (!admin) {
  const pass = process.env.INIT_ADMIN_PASSWORD || "admin123";
  const hash = bcrypt.hashSync(pass, 8);
  db.prepare("INSERT INTO users (username,password,name,email,type) VALUES (?,?,?,?,?)")
    .run("admin", hash, "Administrator", "admin@example.com", "super");
  console.log("✅ Admin user created (username: admin, password: " + pass + ")");
} else {
  console.log("ℹ️ Admin user already exists.");
}

// === SEED DATA SAMPLE ===
const tours = db.prepare("SELECT COUNT(*) AS c FROM tours").get().c;
if (tours === 0) {
  const insertTour = db.prepare(`
    INSERT INTO tours (registrationDate,leadPassenger,paxCount,tourCode,region,departureDate,tourPrice,staff,departureStatus)
    VALUES (?,?,?,?,?,?,?,?,?)
  `);
  const now = new Date().toISOString().split("T")[0];
  insertTour.run(now, "Budi Santoso", 2, "EU-2025-001", "Europe", "2025-12-01", 25000000, "Agent A", "CONFIRMED");
  insertTour.run(now, "Siti Aminah", 1, "AS-2025-002", "Asia", "2025-11-05", 8000000, "Agent B", "PENDING");
  console.log("✅ Sample tours inserted.");
}

const sales = db.prepare("SELECT COUNT(*) AS c FROM sales").get().c;
if (sales === 0) {
  const insertSale = db.prepare(`
    INSERT INTO sales (transactionDate,invoiceNumber,salesAmount,profitAmount,staff)
    VALUES (?,?,?,?,?)
  `);
  insertSale.run("2025-10-15", "INV-001", 15000000, 3000000, "Agent A");
  insertSale.run("2025-10-10", "INV-002", 8000000, 2000000, "Agent B");
  console.log("✅ Sample sales inserted.");
}

console.log("🎉 Database initialization complete.");
