// ============================================================
// scripts/initDatabase.js — Travel Dashboard Enterprise v2.1
// ============================================================

const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

console.log("🧱 Initializing Travel Dashboard database...");

// ============================================================
// 📦 DATABASE SETUP
// ============================================================
const dbDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dbDir, "database.sqlite");

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

console.log(`✅ Database file ready: ${dbPath}`);

// ============================================================
// 🧩 USERS TABLE
// ============================================================
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT,
  email TEXT,
  type TEXT DEFAULT 'basic',      -- basic | semi | super
  failed_attempts INTEGER DEFAULT 0,
  locked INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

const adminExists = db.prepare("SELECT username FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  const hash = bcrypt.hashSync("admin123", 8);
  db.prepare("INSERT INTO users (username, password, name, email, type) VALUES (?,?,?,?,?)")
    .run("admin", hash, "Administrator", "admin@example.com", "super");
  console.log("👑 Default admin created (username: admin, password: admin123)");
} else {
  console.log("ℹ️ Admin user already exists.");
}

// ============================================================
// 🌍 TOURS TABLE
// ============================================================
db.exec(`
CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registrationDate TEXT,
  leadPassenger TEXT,
  allPassengers TEXT,
  paxCount INTEGER DEFAULT 0,
  tourCode TEXT,
  region TEXT,
  departureDate TEXT,
  bookingCode TEXT,
  tourPrice REAL DEFAULT 0,
  discountRemarks TEXT,
  paymentProof TEXT,
  documentReceived TEXT,
  visaProcessStart TEXT,
  visaProcessEnd TEXT,
  documentRemarks TEXT,
  staff TEXT,
  salesAmount REAL DEFAULT 0,
  profitAmount REAL DEFAULT 0,
  departureStatus TEXT DEFAULT 'PENDING',   -- PENDING | JALAN | TIDAK JALAN
  created_at TEXT DEFAULT (datetime('now'))
);
`);
console.log("✅ Table 'tours' ready.");

// ============================================================
// 📊 REPORT_TOURS TABLE
// ============================================================
db.exec(`
CREATE TABLE IF NOT EXISTS report_tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reportDate TEXT DEFAULT (date('now')),
  tourCode TEXT,
  region TEXT,
  paxCount INTEGER DEFAULT 0,
  salesAmount REAL DEFAULT 0,
  profitAmount REAL DEFAULT 0,
  departureStatus TEXT DEFAULT 'PENDING',
  staff TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);
console.log("✅ Table 'report_tours' ready.");

// ============================================================
// 💰 REPORT_SALES TABLE
// ============================================================
db.exec(`
CREATE TABLE IF NOT EXISTS report_sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reportDate TEXT DEFAULT (date('now')),
  transactionDate TEXT,
  totalInvoices INTEGER DEFAULT 0,
  salesAmount REAL DEFAULT 0,
  profitAmount REAL DEFAULT 0,
  staff TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);
console.log("✅ Table 'report_sales' ready.");

// ============================================================
// 📄 REPORT_DOCUMENTS TABLE
// ============================================================
db.exec(`
CREATE TABLE IF NOT EXISTS report_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reportDate TEXT DEFAULT (date('now')),
  totalFiles INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  pending INTEGER DEFAULT 0,
  rejected INTEGER DEFAULT 0,
  remarks TEXT,
  staff TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);
console.log("✅ Table 'report_documents' ready.");

// ============================================================
// 🧠 INDEXING & OPTIMIZATION
// ============================================================
db.exec(`
CREATE INDEX IF NOT EXISTS idx_tours_region ON tours(region);
CREATE INDEX IF NOT EXISTS idx_tours_staff ON tours(staff);
CREATE INDEX IF NOT EXISTS idx_sales_staff ON report_sales(staff);
CREATE INDEX IF NOT EXISTS idx_docs_staff ON report_documents(staff);
CREATE INDEX IF NOT EXISTS idx_reports_date ON report_tours(reportDate);
`);

console.log("⚙️ Indexes created successfully.");

// ============================================================
// 🧾 SEED SAMPLE DATA (OPTIONAL DEMO)
// ============================================================
const tourCount = db.prepare("SELECT COUNT(*) AS total FROM tours").get().total;
if (tourCount === 0) {
  db.prepare(`
    INSERT INTO tours 
    (registrationDate, leadPassenger, allPassengers, paxCount, tourCode, region, departureDate, bookingCode, tourPrice, discountRemarks, staff, salesAmount, profitAmount, departureStatus)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "2025-01-15",
    "Raden Cakra",
    "Raden Cakra, Arifin, Joko",
    3,
    "TRV001",
    "Eropa Barat",
    "2025-02-01",
    "BK001",
    45000000,
    "Diskon early bird",
    "admin",
    50000000,
    8000000,
    "JALAN"
  );
  console.log("🌍 Sample tour data inserted.");
}

// ============================================================
// ✅ DONE
// ============================================================
console.log("🎉 Database initialized successfully!");
db.close();
