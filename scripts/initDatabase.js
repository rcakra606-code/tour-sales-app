// ==========================================================
// 🗄️ initDatabase.js — Travel Dashboard Enterprise v5.4.4
// ==========================================================
// - Membuat & memperbaiki struktur database
// - Memperbaiki tabel users (password_hash, staff_name, role)
// - Membuat ulang akun admin jika rusak
// - Aman untuk Render + NeonDB
// ==========================================================

import pkg from "pg";
import bcryptjs from "bcryptjs";
const bcrypt = bcryptjs;
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDatabase() {
  console.log("🚀 Inisialisasi dan perbaikan struktur database...");

  try {
    // ======================================================
    // USERS TABLE
    // ======================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        staff_name TEXT,
        password_hash TEXT,
        role TEXT CHECK (role IN ('admin','semiadmin','staff')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tambahkan kolom jika hilang
    const requiredColumns = [
      ["staff_name", "TEXT"],
      ["password_hash", "TEXT"],
      ["role", "TEXT DEFAULT 'staff'"],
      ["created_at", "TIMESTAMP DEFAULT NOW()"],
    ];

    for (const [col, type] of requiredColumns) {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col} ${type};`);
    }

    // Migrasi kolom lama
    const checkOld = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'password';
    `);
    if (checkOld.rows.length > 0) {
      console.log("⚙️  Migrasi kolom lama 'password' ke 'password_hash'...");
      await pool.query(`
        UPDATE users SET password_hash = password WHERE password_hash IS NULL;
        ALTER TABLE users DROP COLUMN IF EXISTS password;
      `);
    }

    // Isi nilai default kosong
    await pool.query(`UPDATE users SET role = 'staff' WHERE role IS NULL;`);
    await pool.query(`UPDATE users SET staff_name = username WHERE staff_name IS NULL;`);

    // ======================================================
    // ADMIN DEFAULT ACCOUNT FIX
    // ======================================================
    const { rows } = await pool.query(
      "SELECT id, username, password_hash FROM users WHERE username = 'admin';"
    );

    if (rows.length > 0) {
      const admin = rows[0];
      const hash = admin.password_hash;

      if (!hash || typeof hash !== "string" || !hash.startsWith("$2a$")) {
        console.warn("⚠️  Kolom password_hash admin rusak — memperbaiki...");
        await pool.query("DELETE FROM users WHERE username = 'admin';");

        const newHash = await bcrypt.hash("admin123", 10);
        await pool.query(
          `
          INSERT INTO users (username, staff_name, password_hash, role)
          VALUES ('admin', 'Administrator', $1, 'admin');
          `,
          [newHash]
        );
        console.log("✅ Akun admin diperbaiki (admin / admin123)");
      } else {
        console.log("✅ Akun admin valid — tidak perlu perbaikan");
      }
    } else {
      console.log("⚙️  Membuat akun admin default...");
      const newHash = await bcrypt.hash("admin123", 10);
      await pool.query(
        `
        INSERT INTO users (username, staff_name, password_hash, role)
        VALUES ('admin', 'Administrator', $1, 'admin');
        `,
        [newHash]
      );
      console.log("✅ Akun admin default dibuat (admin / admin123)");
    }

    // ======================================================
    // TABEL LAINNYA
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT
      );
    `);

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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        action TEXT,
        username TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Struktur database siap digunakan!");
  } catch (err) {
    console.error("❌ Error saat inisialisasi database:", err);
  } finally {
    await pool.end();
  }
}

initDatabase();