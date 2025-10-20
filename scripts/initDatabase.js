/**
 * scripts/initDatabase.js
 * ======================================================
 * Travel Dashboard Enterprise v5.0
 * Auto database initializer for Neon (PostgreSQL)
 * ======================================================
 */

import pool from "../config/database.js";
import logger from "../config/logger.js";

async function initDatabase() {
  try {
    logger.info("🔍 Memeriksa tabel database...");

    // === USERS ===
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        staff_name VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // === REGIONS ===
    await pool.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // === TOURS ===
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        registration_date DATE NOT NULL,
        lead_passenger VARCHAR(100) NOT NULL,
        all_passengers TEXT,
        tour_code VARCHAR(50),
        region VARCHAR(100),
        departure_date DATE,
        booking_code VARCHAR(50),
        tour_price NUMERIC(12,2),
        discount_remarks TEXT,
        payment_proof TEXT,
        document_received DATE,
        visa_process_start DATE,
        visa_process_end DATE,
        document_remarks TEXT,
        staff VARCHAR(100),
        sales_amount NUMERIC(12,2),
        profit_amount NUMERIC(12,2),
        departure_status VARCHAR(30) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // === SALES ===
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        transaction_date DATE NOT NULL,
        invoice_number VARCHAR(50),
        staff_name VARCHAR(100),
        sales_amount NUMERIC(12,2),
        profit_amount NUMERIC(12,2),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // === DOCUMENTS ===
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        receive_date DATE NOT NULL,
        send_date DATE,
        guest_name VARCHAR(100),
        passport_visa VARCHAR(100),
        process_type VARCHAR(20),
        booking_code_dms VARCHAR(50),
        invoice_number VARCHAR(50),
        guest_phone VARCHAR(50),
        estimate_finish DATE,
        staff_name VARCHAR(100),
        tour_code VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // === TARGETS (per staff per bulan) ===
    await pool.query(`
      CREATE TABLE IF NOT EXISTS targets (
        id SERIAL PRIMARY KEY,
        staff_name VARCHAR(100) NOT NULL,
        target_month VARCHAR(7) NOT NULL,
        target_sales NUMERIC(12,2),
        target_profit NUMERIC(12,2),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(staff_name, target_month)
      );
    `);

    logger.info("✅ Semua tabel database sudah diverifikasi / dibuat.");

  } catch (err) {
    logger.error("❌ initDatabase error:", err);
  } finally {
    await pool.end();
  }
}

initDatabase();