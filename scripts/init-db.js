// scripts/init-db.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../config/database");

async function init() {
  const ok = await db.verifyConnection(5, 2000);
  if (!ok) {
    console.error("Database not reachable. Aborting init.");
    process.exit(1);
  }

  // create tables
  const tablesSql = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    type TEXT DEFAULT 'basic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tours (
    id SERIAL PRIMARY KEY,
    registrationdate TEXT,
    leadpassenger TEXT,
    allpassengers TEXT,
    tourcode TEXT,
    region TEXT,
    departuredate TEXT,
    bookingcode TEXT,
    tourprice NUMERIC DEFAULT 0,
    salesamount NUMERIC DEFAULT 0,
    profitamount NUMERIC DEFAULT 0,
    departurestatus TEXT DEFAULT 'PENDING',
    staff TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    transaction_date TEXT,
    invoice_number TEXT,
    sales_amount NUMERIC DEFAULT 0,
    profit_amount NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    staff_username TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    receive_date TEXT,
    guest_name TEXT,
    booking_code TEXT,
    tour_code TEXT,
    document_remarks TEXT,
    staff TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    username TEXT,
    role TEXT,
    action TEXT,
    target TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;

  try {
    await db.query(tablesSql);
    console.log("✅ Tables created/checked.");

    // create default admin if not exists
    const adminUser = "admin";
    const adminPass = process.env.INIT_ADMIN_PASSWORD || "admin123";
    const hashed = bcrypt.hashSync(adminPass, 10);

    const exists = await db.query("SELECT id FROM users WHERE username=$1", [adminUser]);
    if (exists.rowCount === 0) {
      await db.query("INSERT INTO users (username, password, name, type) VALUES ($1, $2, $3, $4)", [
        adminUser,
        hashed,
        "Administrator",
        "super",
      ]);
      console.log(`✅ Created default admin user '${adminUser}' (password from INIT_ADMIN_PASSWORD or 'admin123').`);
    } else {
      console.log("ℹ️ Admin user already exists. Skipping creation.");
    }

    console.log("🎉 Init complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Init DB failed:", err.message || err);
    process.exit(1);
  }
}

init();
