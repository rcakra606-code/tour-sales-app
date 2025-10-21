// ==========================================================
// 🗄️ initDatabase.js — Travel Dashboard Enterprise v5.4.1
// ==========================================================
// - Membuat struktur database jika belum ada
// - Memperbaiki tabel lama otomatis (mis. menambahkan password_hash)
// - Membuat akun admin default jika belum ada
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDatabase() {
  console.log("🚀 Inisialisasi dan perbaikan struktur database...");

  try {
    // ======================================================
    // USERS TABLE (Auto-Repair)
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        staff_name TEXT,
        password_hash TEXT,
        role TEXT CHECK (role IN ('admin', 'semiadmin', 'staff')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tambahkan kolom jika belum ada
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_name TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff';`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();`);

    // Cek apakah ada kolom lama bernama 'password'
    const checkOldPass = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='users' AND column_name='password';
    `);
    if (checkOldPass.rows.length > 0) {
      console.log("⚙️  Memigrasi kolom lama 'password' ke 'password_hash'...");
      await pool.query(`
        UPDATE users SET password_hash = password WHERE password_hash IS NULL;
        ALTER TABLE users DROP COLUMN IF EXISTS password;
      `);
    }

    // ======================================================
    // SALES TABLE
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        transaction_date DATE NOT NULL,
        staff_name TEXT,
        invoice_number TEXT,
        sales_amount NUMERIC(12,2) DEFAULT 0,
        profit_amount NUMERIC(12,2) DEFAULT 0,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ======================================================
    // TOURS TABLE
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
        tour_price NUMERIC(12,2),
        discount_remarks TEXT,
        payment_proof TEXT,
        document_received TEXT,
        visa_process_start DATE,
        visa_process_end DATE,
        document_remarks TEXT,
        staff TEXT,
        sales_amount NUMERIC(12,2),
        profit_amount NUMERIC(12,2),
        departure_status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ======================================================
    // DOCUMENTS TABLE
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        received_date DATE NOT NULL,
        sent_date DATE,
        guest_name TEXT,
        document_type TEXT,
        process_type TEXT,
        booking_code TEXT,
        invoice_number TEXT,
        guest_phone TEXT,
        estimated_finish DATE,
        staff_name TEXT,
        tour_code TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ======================================================
    // REGIONS TABLE
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT
      );
    `);

    // ======================================================
    // TARGETS TABLE
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS targets (
        id SERIAL PRIMARY KEY,
        staff_name TEXT NOT NULL,
        month DATE NOT NULL,
        target_sales NUMERIC(12,2) DEFAULT 0,
        target_profit NUMERIC(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ======================================================
    // LOGS TABLE
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        action TEXT,
        username TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ======================================================
    // ADMIN DEFAULT ACCOUNT
    // ======================================================
    const checkAdmin = await pool.query(
      `SELECT * FROM users WHERE username = 'admin' LIMIT 1;`
    );

    if (checkAdmin.rows.length === 0) {
      const adminPassword =
        "$2a$10$5OqZLJ1kXj7DkCOgQGLfeOe7qMx3E5uU5t5ZRxV93V3eAjchjO7dG"; // hash 'admin123'
      await pool.query(
        `INSERT INTO users (username, staff_name, password_hash, role)
         VALUES ('admin', 'Administrator', $1, 'admin');`,
        [adminPassword]
      );
      console.log("✅ Akun admin default dibuat (admin / admin123)");
    } else {
      console.log("ℹ️ Akun admin sudah ada — tidak dibuat ulang");
    }

    console.log("✅ Struktur database siap digunakan!");
  } catch (err) {
    console.error("❌ Error saat inisialisasi database:", err);
  } finally {
    await pool.end();
  }
}

initDatabase();