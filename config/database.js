// config/database.js
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.resolve(__dirname, "../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "travel.db");
const db = new Database(dbPath, { verbose: console.log });

// Create tables if not exist (idempotent)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  username TEXT UNIQUE,
  password TEXT NOT NULL,
  role TEXT,
  type TEXT DEFAULT 'basic'
);

CREATE TABLE IF NOT EXISTS regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
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
  tourPrice REAL,
  discountRemarks TEXT,
  paymentProof TEXT,
  documentReceived TEXT,
  visaProcessStart TEXT,
  visaProcessEnd TEXT,
  staff TEXT,
  departureStatus TEXT,
  documentRemarks TEXT,
  salesAmount REAL,
  profitAmount REAL
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transactionDate TEXT,
  invoiceNumber TEXT,
  salesAmount REAL,
  profitAmount REAL,
  discountAmount REAL,
  discountRemarks TEXT,
  staff TEXT
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  documentReceiveDate TEXT,
  shipmentDate TEXT,
  guestNames TEXT,
  passportVisa TEXT,
  processType TEXT,
  bookingCodeDMS TEXT,
  invoiceNumber TEXT,
  guestPhone TEXT,
  estimatedCompletion TEXT,
  tourType TEXT,
  tourCode TEXT,
  tourDepartureDate TEXT,
  passportUsageDate TEXT,
  passportReceivedDate TEXT,
  documentStatus TEXT,
  visaStatus TEXT,
  remarks TEXT
);

CREATE TABLE IF NOT EXISTS sales_targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff TEXT UNIQUE,
  salesTarget REAL DEFAULT 0,
  profitTarget REAL DEFAULT 0
);
`);

module.exports = db;
