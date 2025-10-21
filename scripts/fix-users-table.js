// ==========================================================
// 🧰 fix-users-table.js — Travel Dashboard Enterprise v5.4.3
// ==========================================================
// Fungsi:
//  - Periksa dan perbaiki kolom users table
//  - Tambahkan kolom yang hilang (password_hash, staff_name, role, created_at)
//  - Validasi dan buat ulang akun admin jika rusak
// ==========================================================

import pkg from "pg";
import bcryptjs from "bcryptjs";
const bcrypt = bcryptjs;
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function fixUsersTable() {
  console.log("🧩 Memeriksa dan memperbaiki tabel 'users'...");

  try {
    // Pastikan tabel ada
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

    // Tambahkan kolom yang mungkin hilang
    const requiredColumns = [
      ["staff_name", "TEXT"],
      ["password_hash", "TEXT"],
      ["role", "TEXT DEFAULT 'staff'"],
      ["created_at", "TIMESTAMP DEFAULT NOW()"],
    ];

    for (const [col, type] of requiredColumns) {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col} ${type};`);
    }

    // Periksa apakah ada kolom lama bernama "password"
    const checkOld = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'password';
    `);
    if (checkOld.rows.length > 0) {
      console.log("⚙️  Memindahkan data dari kolom lama 'password' ke 'password_hash'...");
      await pool.query(`
        UPDATE users SET password_hash = password WHERE password_hash IS NULL;
        ALTER TABLE users DROP COLUMN IF EXISTS password;
      `);
    }

    // Perbaiki data user yang tidak punya role
    await pool.query(`
      UPDATE users SET role = 'staff' WHERE role IS NULL;
    `);

    // Perbaiki data user yang tidak punya staff_name
    await pool.query(`
      UPDATE users SET staff_name = username WHERE staff_name IS NULL;
    `);

    // ======================================================
    // 🧠 Periksa akun admin
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

    console.log("✅ Struktur tabel 'users' sekarang sudah valid dan konsisten!");
  } catch (err) {
    console.error("❌ Gagal memperbaiki tabel users:", err);
  } finally {
    await pool.end();
  }
}

fixUsersTable();