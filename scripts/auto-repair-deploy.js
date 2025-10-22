// ==========================================================
// 🧠 Auto Repair & Deploy — Travel Dashboard Enterprise v5.4.8
// ==========================================================
// Tujuan:
// 1. Pastikan koneksi NeonDB sukses
// 2. Jalankan initDatabase & setup-admin otomatis
// 3. Auto restart jika ada error startup
// ==========================================================

import { execSync } from "child_process";
import pkg from "pg";
import dotenv from "dotenv";
import fs from "fs";
const { Pool } = pkg;

dotenv.config();

const LOG_PATH = "./deploy-check.log";
const DATABASE_URL = process.env.DATABASE_URL;

// ==========================================================
// 🧾 Helper Logging
// ==========================================================
function log(message) {
  const msg = `[${new Date().toISOString()}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(LOG_PATH, msg);
}

// ==========================================================
// 🩺 Step 1: Cek koneksi ke NeonDB
// ==========================================================
async function checkDatabaseConnection() {
  log("🔍 Mengecek koneksi ke NeonDB...");
  if (!DATABASE_URL) {
    log("❌ Variabel DATABASE_URL tidak ditemukan di .env");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const res = await pool.query("SELECT NOW() AS connected_at;");
    log(`✅ Koneksi ke database berhasil: ${res.rows[0].connected_at}`);
  } catch (err) {
    log(`❌ Gagal terhubung ke database: ${err.message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// ==========================================================
// 🧱 Step 2: Jalankan initDatabase.js
// ==========================================================
function runInitDatabase() {
  try {
    log("🛠️  Menjalankan initDatabase.js...");
    execSync("node scripts/initDatabase.js", { stdio: "inherit" });
    log("✅ InitDatabase berhasil dijalankan.");
  } catch (err) {
    log("❌ Gagal menjalankan initDatabase.js");
    log(err.message);
  }
}

// ==========================================================
// 👑 Step 3: Jalankan setup-admin.js
// ==========================================================
function runSetupAdmin() {
  try {
    log("👑 Membuat akun super admin jika belum ada...");
    execSync("node scripts/setup-admin.js", { stdio: "inherit" });
    log("✅ setup-admin.js berhasil dijalankan.");
  } catch (err) {
    log("❌ Gagal menjalankan setup-admin.js");
    log(err.message);
  }
}

// ==========================================================
// 🔁 Step 4: Jalankan server.js
// ==========================================================
function startServer() {
  try {
    log("🚀 Menjalankan server utama...");
    execSync("node server.js", { stdio: "inherit" });
  } catch (err) {
    log("❌ Server error, mencoba restart...");
    setTimeout(startServer, 5000);
  }
}

// ==========================================================
// 🚀 EXECUTION FLOW
// ==========================================================
(async () => {
  log("==========================================");
  log("🧩 AUTO REPAIR DEPLOY STARTED");
  log("==========================================");

  await checkDatabaseConnection();
  runInitDatabase();
  runSetupAdmin();
  startServer();
})();