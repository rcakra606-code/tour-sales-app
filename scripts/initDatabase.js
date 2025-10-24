/**
 * initDatabase.js — FINAL v6.0 schema reset
 * Fully compatible with Neon + Render.
 * Will DROP all existing tables and re-create clean schema.
 */

import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

async function main() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.warn("❌ DATABASE_URL not set — skipping DB init.");
      return;
    }

    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    const client = await pool.connect();
    console.log("Connected to DB — resetting schema v6.0...");
    await client.query("BEGIN");

    // 🧹 Drop old tables
    await client.query(`
      DROP TABLE IF EXISTS logs CASCADE;
      DROP TABLE IF EXISTS targets CASCADE;
      DROP TABLE IF EXISTS documents CASCADE;
      DROP TABLE IF EXISTS sales CASCADE;
      DROP TABLE IF EXISTS tours CASCADE;
      DROP TABLE IF EXISTS regions CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // 👤 Users
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        staff_name VARCHAR(150),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 🌍 Regions
    await client.query(`
      CREATE TABLE regions (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50),
        name VARCHAR(150) NOT NULL
      );
    `);

    // ✈️ Tours
    await client.query(`
      CREATE TABLE tours (
        id SERIAL PRIMARY KEY,
        registration_date DATE,
        lead_passenger VARCHAR(255),
        all_passengers INT DEFAULT 1,
        tour_code VARCHAR(100),
        region_id INT REFERENCES regions(id),
        departure_date DATE,
        booking_code VARCHAR(100),
        tour_price NUMERIC DEFAULT 0,
        discount_remarks TEXT,
        payment_proof TEXT,
        document_received BOOLEAN DEFAULT false,
        visa_process_start DATE,
        visa_process_end DATE,
        document_remarks TEXT,
        staff_name VARCHAR(150),
        sales_amount NUMERIC DEFAULT 0,
        profit_amount NUMERIC DEFAULT 0,
        departure_status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 💰 Sales
    await client.query(`
      CREATE TABLE sales (
        id SERIAL PRIMARY KEY,
        transaction_date DATE,
        invoice VARCHAR(100),
        staff_name VARCHAR(150),
        sales_amount NUMERIC DEFAULT 0,
        profit_amount NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 📄 Documents
    await client.query(`
      CREATE TABLE documents (
        id SERIAL PRIMARY KEY,
        received_date DATE,
        sent_date DATE,
        guest_name VARCHAR(255),
        passport_or_visa VARCHAR(255),
        process_type VARCHAR(50),
        booking_code_dms VARCHAR(100),
        invoice_no VARCHAR(100),
        guest_phone VARCHAR(50),
        eta DATE,
        staff_name VARCHAR(150),
        tour_code VARCHAR(100),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 🎯 Targets
    await client.query(`
      CREATE TABLE targets (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        year INT,
        month INT,
        sales_target NUMERIC DEFAULT 0,
        profit_target NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 🪵 Logs
    await client.query(`
      CREATE TABLE logs (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "user" VARCHAR(150),
        action VARCHAR(150),
        detail TEXT,
        ip VARCHAR(50)
      );
    `);

    // 🔑 Seed super admin
    const hash = bcrypt.hashSync("Admin123", 10);
    await client.query(
      `
      INSERT INTO users (username, staff_name, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING;
      `,
      ["admin", "Super Admin", hash, "superadmin"]
    );

    await client.query("COMMIT");
    console.log("✅ Database reset complete — Admin user seeded (admin / Admin123)");
    client.release();
    await pool.end();
  } catch (err) {
    console.error("❌ DB init failed:", err);
  }
}

main();