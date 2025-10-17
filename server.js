// scripts/init-db.js
/**
 * Inisialisasi database SQLite (tabel + seed)
 *
 * Usage:
 *   node scripts/init-db.js
 *
 * Pastikan package 'better-sqlite3' dan 'bcryptjs' tersedia.
 */

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "database.sqlite");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log("Created data directory:", DATA_DIR);
}

const db = new Database(DB_FILE);

// Wrap in transaction
const exec = db.exec.bind(db);

try {
  exec("PRAGMA journal_mode = WAL;");

  // Users table
  exec(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      name TEXT,
      email TEXT,
      type TEXT DEFAULT 'basic',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Refresh tokens
  exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      token TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Tours table
  exec(`
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
  `);

  // Sales table
  exec(`
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

  // Documents table
  exec(`
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

  console.log("Tables ensured.");

  // Seed admin user if not exists
  const admin = db.prepare("SELECT username FROM users WHERE username = ?").get("admin");
  if (!admin) {
    const pwd = process.env.INIT_ADMIN_PASSWORD || "admin123";
    const hashed = bcrypt.hashSync(pwd, 8);
    db.prepare("INSERT INTO users (username, password, name, email, type) VALUES (?,?,?,?,?)")
      .run("admin", hashed, "Administrator", "admin@example.com", "super");
    console.log("Admin user created - username: admin (type: super). Use ENV INIT_ADMIN_PASSWORD to change initial password.");
  } else {
    console.log("Admin user already exists.");
  }

  // Add sample tours if none
  const tourCount = db.prepare("SELECT COUNT(*) AS c FROM tours").get().c;
  if (!tourCount || tourCount === 0) {
    const insertTour = db.prepare(`
      INSERT INTO tours (
        registrationDate, leadPassenger, allPassengers, paxCount, tourCode, region,
        departureDate, bookingCode, tourPrice, discountRemarks, staff, salesAmount, profitAmount, departureStatus
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);

    const samples = [
      ["2025-09-05", "Budi Santoso", "Budi Santoso, Ani", 2, "EU-SEP-001", "Europe", "2025-10-10", "BK1001", 25000000, "", "Agent A", 25000000, 5000000, "CONFIRMED"],
      ["2025-09-10", "Siti Aminah", "Siti Aminah", 1, "AS-SEP-002", "Asia", "2025-11-01", "BK1002", 8000000, "", "Agent B", 8000000, 2000000, "PENDING"],
      ["2025-09-20", "Joko Widodo", "Joko Widodo, Ibu J", 2, "EU-OCT-003", "Europe", "2025-12-05", "BK1003", 30000000, "", "Agent A", 30000000, 7000000, "CONFIRMED"]
    ];

    const t = db.transaction((rows) => {
      rows.forEach(r => insertTour.run(...r));
    });
    t(samples);
    console.log("Inserted sample tours.");
  } else {
    console.log("Tours already present:", tourCount);
  }

  // Add sample sales if none
  const salesCount = db.prepare("SELECT COUNT(*) AS c FROM sales").get().c;
  if (!salesCount || salesCount === 0) {
    const insertSale = db.prepare(`
      INSERT INTO sales (transactionDate, invoiceNumber, salesAmount, profitAmount, staff)
      VALUES (?,?,?,?,?)
    `);

    const today = new Date();
    const sampleSales = [
      [formatDateOffset(-2), "INV-2001", 15000000, 3000000, "Agent A"],
      [formatDateOffset(-10), "INV-1998", 8000000, 1500000, "Agent B"],
      [formatDateOffset(-20), "INV-1987", 12000000, 2500000, "Agent A"]
    ];

    const t2 = db.transaction((rows) => {
      rows.forEach(r => insertSale.run(...r));
    });
    t2(sampleSales);
    console.log("Inserted sample sales.");
  } else {
    console.log("Sales already present:", salesCount);
  }

  console.log("Database initialization complete.");
} catch (err) {
  console.error("Initialization error:", err && err.message ? err.message : err);
  process.exit(1);
}

/**
 * Helper untuk format tanggal (YYYY-MM-DD) dengan offset hari
 */
function formatDateOffset(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
