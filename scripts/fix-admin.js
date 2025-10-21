// ==========================================================
// 🛠️ fix-admin.js — Travel Dashboard Enterprise v5.4.2
// ==========================================================
// Perbaikan otomatis untuk akun admin default
// - Menghapus admin lama jika invalid
// - Membuat ulang admin dengan password hash valid (admin123)
// ==========================================================

import pkg from "pg";
import bcryptjs from "bcryptjs";
const bcrypt = bcryptjs;
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function fixAdmin() {
  console.log("🛠️ Memeriksa akun admin...");

  try {
    // Pastikan tabel users ada
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

    // Ambil data admin
    const { rows } = await pool.query(
      "SELECT id, username, password_hash FROM users WHERE username = 'admin';"
    );

    if (rows.length > 0) {
      const admin = rows[0];

      // Cek apakah password_hash valid string bcrypt
      const hash = admin.password_hash;
      if (!hash || typeof hash !== "string" || !hash.startsWith("$2a$")) {
        console.warn("⚠️ Kolom password_hash admin rusak — akan diperbaiki...");
        await pool.query("DELETE FROM users WHERE username = 'admin';");
      } else {
        console.log("✅ Akun admin sudah valid — tidak perlu diperbaiki");
        await pool.end();
        return;
      }
    }

    // Buat akun admin baru
    const newHash = await bcrypt.hash("admin123", 10);
    await pool.query(
      `
      INSERT INTO users (username, staff_name, password_hash, role)
      VALUES ('admin', 'Administrator', $1, 'admin');
      `,
      [newHash]
    );

    console.log("✅ Akun admin default dibuat ulang (admin / admin123)");
  } catch (err) {
    console.error("❌ Gagal memperbaiki akun admin:", err);
  } finally {
    await pool.end();
  }
}

fixAdmin();