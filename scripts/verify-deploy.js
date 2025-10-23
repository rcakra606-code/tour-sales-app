// ==========================================================
// 🚀 Verify + Auto-Fix Deploy Script — Travel Dashboard v5.5
// ==========================================================
import dotenv from "dotenv";
import pkg from "pg";
import fetch from "node-fetch";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const REQUIRED_TABLES = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      staff_name VARCHAR(100),
      role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('admin','semi-admin','staff')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  regions: `
    CREATE TABLE IF NOT EXISTS regions (
      id SERIAL PRIMARY KEY,
      region_name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  tours: `
    CREATE TABLE IF NOT EXISTS tours (
      id SERIAL PRIMARY KEY,
      registration_date DATE,
      lead_passenger VARCHAR(100),
      all_passengers TEXT,
      tour_code VARCHAR(50),
      region_id INT REFERENCES regions(id) ON DELETE SET NULL,
      departure_date DATE,
      booking_code VARCHAR(100),
      tour_price NUMERIC(12,2),
      discount_remarks TEXT,
      payment_proof TEXT,
      document_received DATE,
      visa_process_start DATE,
      visa_process_end DATE,
      document_remarks TEXT,
      staff_name VARCHAR(100),
      sales_amount NUMERIC(12,2),
      profit_amount NUMERIC(12,2),
      departure_status VARCHAR(20) DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  sales: `
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      transaction_date DATE,
      invoice_number VARCHAR(100),
      customer_name VARCHAR(100),
      tour_code VARCHAR(50),
      sales_amount NUMERIC(12,2),
      profit_amount NUMERIC(12,2),
      staff_name VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  documents: `
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      receive_date DATE,
      send_date DATE,
      guest_name VARCHAR(100),
      passport_visa_country VARCHAR(100),
      process_type VARCHAR(50),
      booking_code_dms VARCHAR(100),
      invoice_number VARCHAR(100),
      guest_phone VARCHAR(50),
      estimated_finish DATE,
      staff_name VARCHAR(100),
      tour_code VARCHAR(50),
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  targets: `
    CREATE TABLE IF NOT EXISTS targets (
      id SERIAL PRIMARY KEY,
      staff_name VARCHAR(100),
      target_month INT,
      target_year INT,
      target_sales NUMERIC(12,2),
      target_profit NUMERIC(12,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  logs: `
    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      user_name VARCHAR(100),
      role VARCHAR(20),
      action VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `
};

async function ensureTables() {
  console.log("\n🔍 Checking database tables...");
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
    );
    const existing = result.rows.map((r) => r.table_name);

    for (const [table, sql] of Object.entries(REQUIRED_TABLES)) {
      if (!existing.includes(table)) {
        console.warn(`⚠️ Table missing: ${table} → Creating now...`);
        await client.query(sql);
        console.log(`✅ Created table: ${table}`);
      } else {
        console.log(`✅ Table OK: ${table}`);
      }
    }

    // ensure default admin
    const adminCheck = await client.query(
      "SELECT * FROM users WHERE username='admin';"
    );
    if (adminCheck.rows.length === 0) {
      await client.query(
        "INSERT INTO users (username,password_hash,staff_name,role) VALUES ($1,$2,$3,$4)",
        [
          "admin",
          "$2a$10$ZJbReuZx.bVG7pr8lLu3wOg3bV20zPpxfVhQwvfth9OYhU5hMLPka",
          "Administrator",
          "admin"
        ]
      );
      console.log("👑 Default admin created (admin / admin123)");
    } else {
      console.log("✅ Admin account exists.");
    }

    console.log("📋 Database structure verified.\n");
  } catch (err) {
    console.error("❌ Database verification failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

// === API endpoint verification (optional) ===
async function checkEndpoints() {
  const base = process.env.FRONTEND_URL || "https://tour-sales-app.onrender.com";
  console.log("🌐 Checking API endpoints...\n");
  const endpoints = ["/api/auth/verify", "/api/dashboard/summary", "/api/regions"];

  for (const ep of endpoints) {
    const url = `${base}${ep}`;
    try {
      const res = await fetch(url);
      console.log(`🧭 ${ep} → ${res.status}`);
    } catch (err) {
      console.warn(`⚠️ ${ep} unreachable: ${err.message}`);
    }
  }
}

(async () => {
  console.log("=================================================");
  console.log("🧩 Travel Dashboard Enterprise v5.5 — Auto Verifier");
  console.log("=================================================");
  await ensureTables();
  await checkEndpoints();
  console.log("\n✅ Verification completed successfully.\n");
  process.exit(0);
})();