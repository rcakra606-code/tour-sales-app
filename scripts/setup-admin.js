// ==========================================================
// 👑 Setup Super Admin — Travel Dashboard Enterprise v5.4.8
// ==========================================================
// Otomatis membuat akun admin default jika belum ada.
// ==========================================================

import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function setupAdmin() {
  try {
    console.log("🔍 Mengecek akun super admin...");

    const check = await pool.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");

    if (check.rows.length > 0) {
      console.log(`✅ Akun super admin sudah ada: ${check.rows[0].username}`);
      await pool.end();
      return;
    }

    const hash = await bcrypt.hash("admin123", 10);

    await pool.query(
      "INSERT INTO users (username, password_hash, role, staff_name) VALUES ($1, $2, $3, $4)",
      ["admin", hash, "admin", "Super Admin"]
    );

    console.log("✅ Akun super admin berhasil dibuat:");
    console.log("   👤 Username: admin");
    console.log("   🔑 Password: admin123");
  } catch (err) {
    console.error("❌ Gagal membuat super admin:", err);
  } finally {
    await pool.end();
    console.log("🏁 Setup admin selesai.");
  }
}

setupAdmin();