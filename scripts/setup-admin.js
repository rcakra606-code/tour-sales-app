/**
 * ==========================================================
 * 📁 scripts/setup-admin.js (Fixed)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Script otomatis membuat akun SUPER ADMIN
 * dengan perbaikan koneksi Pool (Render-safe)
 * ==========================================================
 */

import bcrypt from "bcrypt";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function setupAdmin() {
  const username = "admin";
  const password = "Admin123!";
  const hashed = await bcrypt.hash(password, 10);

  try {
    console.log("🔍 Mengecek akun super admin...");

    const check = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (check.rows.length > 0) {
      console.log("✅ Akun super admin sudah ada:", check.rows[0].username);
      return; // ❗ STOP di sini tanpa menutup pool
    }

    console.log("🚀 Membuat akun super admin baru...");
    await pool.query(
      `INSERT INTO users (username, password, role, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [username, hashed, "super"]
    );

    console.log("✅ Super Admin berhasil dibuat!");
    console.log("🔑 Login dengan:");
    console.log("   Username: admin");
    console.log("   Password: Admin123!");
  } catch (err) {
    console.error("❌ Gagal membuat akun super admin:", err.message);
  } finally {
    try {
      await pool.end();
      console.log("🔌 Koneksi database ditutup dengan aman.");
    } catch (e) {
      console.warn("⚠️ Koneksi sudah ditutup sebelumnya, aman diabaikan.");
    }
  }
}

setupAdmin();