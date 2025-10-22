// ==========================================================
// 🗃️ Init Database — Travel Dashboard Enterprise v5.4.8
// ==========================================================
// Fitur:
// - Auto create all tables if not exist
// - Safe schema check (NeonDB / PostgreSQL)
// - Logs table, targets, users, sales, tours, documents, regions
// ==========================================================

import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDatabase() {
  try {
    console.log("🚀 Initializing Travel Dashboard Database...");

    // ======================================================
    // 👤 USERS
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'staff',
        staff_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ======================================================
    // 🌍 REGIONS
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        region_name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ======================================================
    // ✈️ TOURS
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        registration_date DATE,
        lead_passenger TEXT,
        all_passengers TEXT,
        tour_code TEXT,
        region TEXT,
        departure_date DATE,
        booking_code TEXT,
        tour_price NUMERIC(12,2) DEFAULT 0,
        discount_remarks TEXT,
        payment_proof TEXT,
        document_received DATE,
        visa_process_start DATE,
        visa_process_end DATE,
        document_remarks TEXT,
        staff_name TEXT,
        sales_amount NUMERIC(12,2) DEFAULT 0,
        profit_amount NUMERIC(12,2) DEFAULT 0,
        departure_status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ======================================================
    // 💰 SALES
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        transaction_date DATE,
        invoice_number TEXT,
        customer_name TEXT,
        sales_category TEXT,
        sales_amount NUMERIC(12,2),
        profit_amount NUMERIC(12,2),
        staff_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ======================================================
    // 📑 DOCUMENTS
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        receive_date DATE,
        send_date DATE,
        guest_name TEXT,
        passport_visa TEXT,
        process_type TEXT,
        booking_code_dms TEXT,
        invoice_number TEXT,
        phone_number TEXT,
        estimated_finish DATE,
        staff_name TEXT,
        tour_code TEXT,
        document_remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ======================================================
    // 🎯 TARGETS
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS targets (
        id SERIAL PRIMARY KEY,
        staff_name TEXT NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL,
        target_sales NUMERIC(12,2) DEFAULT 0,
        target_profit NUMERIC(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ======================================================
    // 🧾 LOGS
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        staff_name TEXT,
        action TEXT,
        description TEXT,
        module TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ All tables created or already exist.");
  } catch (err) {
    console.error("❌ Database initialization error:", err);
  } finally {
    await pool.end();
    console.log("🏁 Database setup complete.");
  }
}

initDatabase();