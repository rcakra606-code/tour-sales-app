import { pool } from "../server.js";
import bcrypt from "bcryptjs";

const schema = `
-- ==========================================================
-- 🚀 Auto Reset + Seed Script — Travel Dashboard v5.4.9
-- ==========================================================

DROP TABLE IF EXISTS logs, targets, documents, sales, tours, regions, users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  staff_name VARCHAR(150),
  role VARCHAR(50) DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE regions (
  id SERIAL PRIMARY KEY,
  region_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tours (
  id SERIAL PRIMARY KEY,
  registration_date DATE,
  lead_passenger VARCHAR(150),
  all_passengers TEXT,
  tour_code VARCHAR(100),
  region VARCHAR(100),
  departure_date DATE,
  booking_code VARCHAR(100),
  tour_price NUMERIC DEFAULT 0,
  discount_remarks TEXT,
  payment_proof TEXT,
  document_received DATE,
  visa_process_start DATE,
  visa_process_end DATE,
  document_remarks TEXT,
  staff_name VARCHAR(150),
  sales_amount NUMERIC DEFAULT 0,
  profit_amount NUMERIC DEFAULT 0,
  departure_status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  transaction_date DATE,
  invoice_number VARCHAR(100),
  customer_name VARCHAR(150),
  sales_category VARCHAR(100),
  sales_amount NUMERIC DEFAULT 0,
  profit_amount NUMERIC DEFAULT 0,
  staff_name VARCHAR(150),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  receive_date DATE,
  send_date DATE,
  guest_name VARCHAR(150),
  passport_visa VARCHAR(100),
  process_type VARCHAR(50),
  booking_code_dms VARCHAR(100),
  invoice_number VARCHAR(100),
  phone_number VARCHAR(50),
  estimated_finish DATE,
  staff_name VARCHAR(150),
  tour_code VARCHAR(100),
  document_remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE targets (
  id SERIAL PRIMARY KEY,
  staff_name VARCHAR(150),
  month INT,
  year INT,
  target_sales NUMERIC DEFAULT 0,
  target_profit NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  action TEXT,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

async function resetAndSeed() {
  try {
    console.log("🚨 Resetting NeonDB schema...");
    await pool.query(schema);
    console.log("✅ Database structure synced.");

    // Seed super admin
    const adminUsername = "admin";
    const adminPassword = "admin123";
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const checkAdmin = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [adminUsername]
    );

    if (checkAdmin.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (username, password_hash, staff_name, role) VALUES ($1, $2, $3, $4)",
        [adminUsername, passwordHash, "Super Admin", "admin"]
      );
      console.log("👑 Admin default created (admin / admin123)");
    } else {
      console.log("✅ Admin already exists, skipping seed.");
    }

    // Seed sample region
    await pool.query(`
      INSERT INTO regions (region_name, description)
      VALUES
        ('Asia', 'Region wisata Asia'),
        ('Eropa', 'Region wisata Eropa'),
        ('Amerika', 'Region wisata Amerika')
      ON CONFLICT DO NOTHING;
    `);
    console.log("🌍 Sample regions added.");

    console.log("🎯 Auto reset & seed complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Auto reset failed:", err);
    process.exit(1);
  }
}

resetAndSeed();