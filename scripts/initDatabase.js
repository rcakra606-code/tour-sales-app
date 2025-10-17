// scripts/initDatabase.js — Final Production Version (Integrated Reports)
// Jalankan: node scripts/initDatabase.js

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "database.sqlite");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_FILE);
db.exec("PRAGMA journal_mode = WAL;");

console.log("🚀 Initializing database...");

/* ===========================================================
   🧱 USERS
=========================================================== */
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT,
  email TEXT,
  type TEXT DEFAULT 'basic', -- 'basic', 'semi', 'super'
  failed_attempts INTEGER DEFAULT 0,
  locked INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

const admin = db.prepare("SELECT username FROM users WHERE username = ?").get("admin");
if (!admin) {
  const hash = bcrypt.hashSync("admin123", 8);
  db.prepare("INSERT INTO users (username, password, name, email, type) VALUES (?,?,?,?,?)")
    .run("admin", hash, "Administrator", "admin@example.com", "super");
  console.log("✅ Admin user created (username: admin, password: admin123)");
} else {
  console.log("ℹ️ Admin user already exists.");
}

/* ===========================================================
   🌍 REGIONS
=========================================================== */
db.exec(`
CREATE TABLE IF NOT EXISTS regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);
const regionCount = db.prepare("SELECT COUNT(*) AS c FROM regions").get().c;
if (regionCount === 0) {
  db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)").run("Asia", "Regional tours in Asia");
  db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)").run("Europe", "Regional tours in Europe");
  db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)").run("Middle East", "Regional tours in Middle East");
  console.log("✅ Default regions inserted.");
}

/* ===========================================================
   🧳 TOURS
=========================================================== */
db.exec(`
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
  departureStatus TEXT DEFAULT 'PENDING'
);
`);
const tourCount = db.prepare("SELECT COUNT(*) AS c FROM tours").get().c;
if (tourCount === 0) {
  db.prepare(`
    INSERT INTO tours (
      registrationDate, leadPassenger, allPassengers, paxCount,
      tourCode, region, departureDate, bookingCode, tourPrice,
      discountRemarks, staff, salesAmount, profitAmount, departureStatus
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    "2025-09-10", "Budi Santoso", "Budi Santoso, Ani", 2,
    "EU-SEP-001", "Europe", "2025-10-10", "BK1001", 25000000,
    "", "Agent A", 25000000, 5000000, "JALAN"
  );
  db.prepare(`
    INSERT INTO tours (
      registrationDate, leadPassenger, allPassengers, paxCount,
      tourCode, region, departureDate, bookingCode, tourPrice,
      discountRemarks, staff, salesAmount, profitAmount, departureStatus
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    "2025-09-12", "Siti Aminah", "Siti Aminah", 1,
    "AS-SEP-002", "Asia", "2025-11-01", "BK1002", 8000000,
    "Early Bird Discount", "Agent B", 8000000, 2000000, "TIDAK JALAN"
  );
  console.log("✅ Sample tours inserted.");
}

/* ===========================================================
   💰 SALES
=========================================================== */
db.exec(`
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transactionDate TEXT,
  invoiceNumber TEXT,
  salesAmount INTEGER,
  profitAmount INTEGER,
  staff TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);
const salesCount = db.prepare("SELECT COUNT(*) AS c FROM sales").get().c;
if (salesCount === 0) {
  db.prepare("INSERT INTO sales (transactionDate, invoiceNumber, salesAmount, profitAmount, staff) VALUES (?,?,?,?,?)")
    .run("2025-09-15", "INV-1001", 15000000, 3000000, "Agent A");
  db.prepare("INSERT INTO sales (transactionDate, invoiceNumber, salesAmount, profitAmount, staff) VALUES (?,?,?,?,?)")
    .run("2025-09-20", "INV-1002", 12000000, 2500000, "Agent B");
  console.log("✅ Sample sales inserted.");
}

/* ===========================================================
   📄 DOCUMENTS
=========================================================== */
db.exec(`
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
const docCount = db.prepare("SELECT COUNT(*) AS c FROM documents").get().c;
if (docCount === 0) {
  db.prepare(`
    INSERT INTO documents (
      documentReceiveDate, guestNames, bookingCodeDMS, tourCode, documentRemarks, documentStatus
    ) VALUES (?,?,?,?,?,?)
  `).run("2025-09-20", "Budi Santoso", "DMS-001", "EU-SEP-001", "Complete", "Received");
  db.prepare(`
    INSERT INTO documents (
      documentReceiveDate, guestNames, bookingCodeDMS, tourCode, documentRemarks, documentStatus
    ) VALUES (?,?,?,?,?,?)
  `).run("2025-09-21", "Siti Aminah", "DMS-002", "AS-SEP-002", "Waiting Visa", "Pending");
  console.log("✅ Sample documents inserted.");
}

/* ===========================================================
   📊 REPORTS: TOUR, SALES, DOCUMENTS
=========================================================== */
db.exec(`
CREATE TABLE IF NOT EXISTS report_tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reportDate TEXT,
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
  departureStatus TEXT DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS report_sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reportDate TEXT,
  transactionDate TEXT,
  totalInvoices INTEGER,
  salesAmount INTEGER,
  profitAmount INTEGER,
  staff TEXT
);

CREATE TABLE IF NOT EXISTS report_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reportDate TEXT,
  totalFiles INTEGER,
  completed INTEGER,
  pending INTEGER,
  rejected INTEGER,
  remarks TEXT,
  staff TEXT
);
`);

const rTour = db.prepare("SELECT COUNT(*) AS c FROM report_tours").get().c;
const rSales = db.prepare("SELECT COUNT(*) AS c FROM report_sales").get().c;
const rDocs = db.prepare("SELECT COUNT(*) AS c FROM report_documents").get().c;

if (rTour === 0) {
  db.prepare(`
    INSERT INTO report_tours (
      reportDate, registrationDate, leadPassenger, paxCount, tourCode, region, departureDate, bookingCode,
      tourPrice, staff, salesAmount, profitAmount, departureStatus
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    "2025-10-01", "2025-09-10", "Budi Santoso", 2, "EU-SEP-001", "Europe", "2025-10-10", "BK1001",
    25000000, "Agent A", 25000000, 5000000, "JALAN"
  );
  console.log("✅ Sample report_tours inserted.");
}

if (rSales === 0) {
  db.prepare(`
    INSERT INTO report_sales (reportDate, transactionDate, totalInvoices, salesAmount, profitAmount, staff)
    VALUES (?,?,?,?,?,?)
  `).run("2025-10-01", "2025-09-15", 5, 15000000, 3000000, "Agent A");
  console.log("✅ Sample report_sales inserted.");
}

if (rDocs === 0) {
  db.prepare(`
    INSERT INTO report_documents (reportDate, totalFiles, completed, pending, rejected, remarks, staff)
    VALUES (?,?,?,?,?,?,?)
  `).run("2025-10-01", 10, 6, 3, 1, "Visa delay for some guests", "Admin");
  console.log("✅ Sample report_documents inserted.");
}

/* ===========================================================
   ✅ DONE
=========================================================== */
console.log("🎉 Database initialization complete!");
db.close();
