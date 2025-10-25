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

    // Drop old tables if exist (cascade to be safe)
    await client.query(`
      DROP TABLE IF EXISTS logs CASCADE;
      DROP TABLE IF EXISTS targets CASCADE;
      DROP TABLE IF EXISTS documents CASCADE;
      DROP TABLE IF EXISTS sales CASCADE;
      DROP TABLE IF EXISTS tours CASCADE;
      DROP TABLE IF EXISTS regions CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Users
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        staff_name VARCHAR(150),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT staff,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Regions
    await client.query(`
      CREATE TABLE regions (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50),
        name VARCHAR(150) NOT NULL
      );
    `);

    // Tours
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
        departure_status VARCHAR(50) DEFAULT \PENDING',
