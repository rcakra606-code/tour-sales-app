/**
 * ==========================================================
 * 🗄️ scripts/initDatabase.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Script ini akan:
 * - Membuat tabel utama (users, tours, sales, documents, targets)
 * - Menambahkan akun superadmin default (jika belum ada)
 * ==========================================================
 */

import pkg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDatabase() {
  try {
    console.log("🚀 Inisialisasi database...");

    // ======== USERS TABLE ========
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        staff_name VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('staff','admin','super')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ======== TOURS TABLE ========
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tours (
        id SERIAL PRIMARY KEY,
        registration_date DATE,
        lead_passenger VARCHAR(100),
        all_passengers TEXT,
        tour_code VARCHAR(50),
        region VARCHAR(50),
        departure_date DATE,
        booking_code VARCHAR(50),
        tour_price NUMERIC(12,2) DEFAULT 0,
        discount_remarks TEXT,
        payment_proof TEXT,
        document_received DATE,
        visa_process_start DATE,
        visa_process_end DATE,
        document_remarks TEXT,
        staff VARCHAR(100),
        sales_amount NUMERIC(12,2) DEFAULT 0,
        profit_amount NUMERIC(12,2) DEFAULT 0,
        departure_status VARCHAR(20) DEFAULT 'PENDING'
      );
    `);

    // ======== SALES TABLE ========
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        transaction_date DATE DEFAULT NOW(),
        staff_name VARCHAR(100),
        sales_amount NUMERIC(12,2) DEFAULT 0,
        profit_amount NUMERIC(12,2) DEFAULT 0
      );
    `);

    // ======== DOCUMENTS TABLE ========
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        receive_date DATE,
        guest_name VARCHAR(100),
        booking_code_dms VARCHAR(50),
        tour_code VARCHAR(50),
        remarks TEXT
      );
    `);

    // ======== TARGETS TABLE ========
    await pool.query(`
      CREATE TABLE IF NOT EXISTS targets (
        id SERIAL PRIMARY KEY,
        category VARCHAR(50),
        target_amount NUMERIC(12,2) DEFAULT 0,
        actual_amount NUMERIC(12,2) DEFAULT 0,
        target_month INT,
        target_year INT,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ======== INDEXES ========
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tours_region ON tours(region);
      CREATE INDEX IF NOT EXISTS idx_sales_staff_name ON sales(staff_name);
      CREATE INDEX IF NOT EXISTS idx_documents_booking ON documents(booking_code_dms);
    `);

    // ======== SUPERADMIN SEED ========
    const checkAdmin = await pool.query(`SELECT * FROM users WHERE username = 'admin'`);
    if (checkAdmin.rows.length === 0) {
      const hashed = await bcrypt.hash("admin123", 10);
      await pool.query(
        `INSERT INTO users (username, staff_name, password, role) VALUES ($1, $2, $3, $4)`,
        ["admin", "Super Administrator", hashed, "super"]
      );
      console.log("✅ Superadmin default ditambahkan: admin / admin123");
    } else {
      console.log("ℹ️ Superadmin sudah ada, tidak ditambahkan ulang.");
    }

    console.log("✅ Semua tabel dan data awal berhasil dibuat.");
  } catch (err) {
    console.error("❌ Gagal inisialisasi database:", err.message);
  } finally {
    await pool.end();
    console.log("🏁 Koneksi database ditutup.");
  }
}

initDatabase();