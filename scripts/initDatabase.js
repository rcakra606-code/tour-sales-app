// ==========================================================
// 🧱 Travel Dashboard Enterprise v5.4.6
// Database Initialization Script for NeonDB / Render PostgreSQL
// ==========================================================
// Fungsi: Membaca file update-schema.sql dan menjalankannya otomatis
// ==========================================================

import pkg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ==========================================================
// 📍 Setup Path & PostgreSQL Connection
// ==========================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, "update-schema.sql");

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🚀 Main Execution
// ==========================================================
async function initDB() {
  console.log("🧩 Starting database initialization...");
  console.log(`📄 Loading schema file from: ${schemaPath}`);

  try {
    // Pastikan file ada
    if (!fs.existsSync(schemaPath)) {
      console.error("❌ Schema file not found:", schemaPath);
      process.exit(1);
    }

    // Baca isi file SQL
    const sql = fs.readFileSync(schemaPath, "utf8");
    console.log("📦 Executing SQL script...");
    await pool.query(sql);

    console.log("✅ Database schema updated successfully!");

    // Verifikasi hasil
    const verify = await pool.query(`
      SELECT COUNT(*) AS user_count FROM users;
    `);
    console.log(`👥 Users table check: ${verify.rows[0].user_count} record(s)`);

    const tourCheck = await pool.query(`
      SELECT COUNT(*) AS tour_count FROM tours;
    `);
    console.log(`✈️ Tours table check: ${tourCheck.rows[0].tour_count} record(s)`);

    const salesCheck = await pool.query(`
      SELECT COUNT(*) AS sales_count FROM sales;
    `);
    console.log(`💹 Sales table check: ${salesCheck.rows[0].sales_count} record(s)`);

    console.log("🎯 Database initialization completed successfully!");
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Database schema update failed:", err.message);
    if (err.detail) console.error("📄 Detail:", err.detail);
    process.exit(1);
  }
}

initDB();