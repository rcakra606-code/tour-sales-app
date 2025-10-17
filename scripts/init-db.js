// scripts/init-db.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'database.sqlite');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

const schema = [
  `CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT,
    name TEXT,
    email TEXT,
    type TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS tours (
    id INTEGER PRIMARY KEY,
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
  )`,
  `CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY,
    transactionDate TEXT,
    invoiceNumber TEXT,
    salesAmount INTEGER,
    profitAmount INTEGER,
    discountAmount INTEGER,
    discountRemarks TEXT,
    staff TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY,
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
    visaStatus TEXT
  )`
];

schema.forEach(sql => db.prepare(sql).run());

// Seed admin users if not exist
const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
if (count === 0) {
  const insert = db.prepare('INSERT INTO users (username, password, name, email, type) VALUES (?,?,?,?,?)');
  insert.run('admin', bcrypt.hashSync('admin123', 8), 'Administrator', 'admin@company.com', 'super');
  insert.run('semiadmin', bcrypt.hashSync('semi123', 8), 'Semi Super Admin', 'semiadmin@company.com', 'semi');
  insert.run('staff1', bcrypt.hashSync('staff123', 8), 'Staff Satu', 'staff1@company.com', 'basic');
  insert.run('staff2', bcrypt.hashSync('staff456', 8), 'Staff Dua', 'staff2@company.com', 'basic');
  console.log('✅ Default users seeded');
}

console.log('✅ Database initialized successfully at:', dbPath);
db.close();
