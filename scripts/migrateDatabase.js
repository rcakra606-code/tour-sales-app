// ==========================================================
// 🧩 Travel Dashboard Enterprise v5.2
// Safe Database Migration Script (for Neon PostgreSQL)
// ==========================================================

import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function migrate() {
  console.log("⏳ Running database migrations...");

  const migrations = [
    // USERS TABLE
    `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      staff_name VARCHAR(100) DEFAULT '',
      role VARCHAR(20) DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_name VARCHAR(100) DEFAULT '';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'staff';
    `,

    // TOURS TABLE
    `
    CREATE TABLE IF NOT EXISTS tours (
      id SERIAL PRIMARY KEY,
      registration_date DATE,
      lead_passenger VARCHAR(100),
      all_passengers TEXT,
      tour_code VARCHAR(50),
      region VARCHAR(100),
      departure_date DATE,
      booking_code VARCHAR(50),
      tour_price NUMERIC DEFAULT 0,
      discount_remarks TEXT,
      payment_proof TEXT,
      document_received DATE,
      visa_process_start DATE,
      visa_process_end DATE,
      document_remarks TEXT,
      staff VARCHAR(100),
      sales_amount NUMERIC DEFAULT 0,
      profit_amount NUMERIC DEFAULT 0,
      departure_status VARCHAR(20) DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS all_passengers TEXT;
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS region VARCHAR(100);
    ALTER TABLE tours ADD COLUMN IF NOT EXISTS profit_amount NUMERIC DEFAULT 0;
    `,

    // SALES TABLE
    `
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      transaction_date DATE NOT NULL,
      invoice_number VARCHAR(50) NOT NULL,
      staff_name VARCHAR(100),
      sales_amount NUMERIC DEFAULT 0,
      profit_amount NUMERIC DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE sales ADD COLUMN IF NOT EXISTS staff_name VARCHAR(100);
    `,

    // TARGETS TABLE
    `
    CREATE TABLE IF NOT EXISTS targets (
      id SERIAL PRIMARY KEY,
      staff_name VARCHAR(100),
      target_month DATE,
      target_sales NUMERIC DEFAULT 0,
      target_profit NUMERIC DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,

    // DOCUMENTS TABLE
    `
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      receive_date DATE,
      send_date DATE,
      guest_name VARCHAR(100),
      passport_visa VARCHAR(100),
      process_type VARCHAR(20) DEFAULT 'Biasa',
      booking_code_dms VARCHAR(50),
      invoice_number VARCHAR(50),
      guest_phone VARCHAR(50),
      estimate_finish DATE,
      staff_name VARCHAR(100),
      tour_code VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE documents ADD COLUMN IF NOT EXISTS process_type VARCHAR(20) DEFAULT 'Biasa';
    ALTER TABLE documents ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50);
    `,

    // REGIONS TABLE
    `
    CREATE TABLE IF NOT EXISTS regions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,

    // LOGS TABLE
    `
    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100),
      action VARCHAR(50),
      description TEXT,
      ip VARCHAR(50),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,

    // HEALTH CHECK TABLE (optional tracking)
    `
    CREATE TABLE IF NOT EXISTS system_status (
      id SERIAL PRIMARY KEY,
      last_migration TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
  ];

  try {
    for (let i = 0; i < migrations.length; i++) {
      await pool.query(migrations[i]);
      console.log(`✅ Migration step ${i + 1}/${migrations.length} completed`);
    }
    console.log("🎉 All migrations executed successfully!");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
  } finally {
    await pool.end();
  }
}