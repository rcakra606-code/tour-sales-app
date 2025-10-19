/**
 * ==========================================================
 * 📁 scripts/initDatabase.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Script ini membuat seluruh tabel utama (jika belum ada)
 * di NeonDB PostgreSQL saat pertama kali dijalankan.
 * ==========================================================
 */

import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDatabase() {
  console.log("🧱 Inisialisasi struktur database...");

  try {
    // === USERS ===
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'basic',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // === SALES ===
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        staff_name VARCHAR(100) NOT NULL,
        transaction_date DATE NOT NULL,
        sales_amount NUMERIC(15,2) DEFAULT 0,
        profit_amount NUMERIC(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // === TOURS ===
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        registration_date DATE NOT NULL,
        lead_passenger VARCHAR(255),
        all_passengers TEXT,
        tour_code VARCHAR(100),
        region VARCHAR(100),
        departure_date DATE,
        booking_code VARCHAR(100),
        tour_price NUMERIC(15,2) DEFAULT 0,
        discount_remarks TEXT,
        payment_proof TEXT,
        document_received DATE,
        visa_process_start DATE,
        visa_process_end DATE,
        document_remarks TEXT,
        staff VARCHAR(100),
        sales_amount NUMERIC(15,2) DEFAULT 0,
        profit_amount NUMERIC(15,2) DEFAULT 0,
        departure_status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // === DOCUMENTS ===
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        received_date DATE NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        booking_code VARCHAR(100),
        tour_code VARCHAR(100),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // === TARGETS ===
    await pool.query(`
      CREATE TABLE IF NOT EXISTS targets (
        id SERIAL PRIMARY KEY,
        staff_name VARCHAR(100) NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL,
        target_sales NUMERIC(15,2) DEFAULT 0,
        target_profit NUMERIC(15,2) DEFAULT 0,
        target_tours INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(staff_name, month, year)
      );
    `);

    console.log("✅ Semua tabel sudah siap digunakan!");

  } catch (err) {
    console.error("❌ Gagal menginisialisasi database:", err.message);
  } finally {
    await pool.end();
  }
}

initDatabase();