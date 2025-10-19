/**
 * ==========================================================
 * 📁 scripts/setup-cron.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Membuat backup otomatis NeonDB (PostgreSQL)
 * ke folder /backups setiap hari pada jam 03:00 UTC.
 * ==========================================================
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

const BACKUP_DIR = path.resolve("./backups");
const DATABASE_URL = process.env.DATABASE_URL;

// Pastikan folder backup tersedia
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log("📁 Folder backup dibuat:", BACKUP_DIR);
}

// Fungsi backup utama
async function backupDatabase() {
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL tidak ditemukan di .env");
    return;
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .split("T")[0];
  const filePath = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);

  console.log("⏳ Membuat backup database ke:", filePath);

  const command = `pg_dump "${DATABASE_URL}" --no-owner --no-acl > "${filePath}"`;

  exec(command, (err) => {
    if (err) {
      console.error("❌ Gagal backup database:", err.message);
    } else {
      console.log("✅ Backup selesai:", filePath);
    }
  });
}

// Jalankan backup setiap hari jam 03:00 UTC
cron.schedule("0 3 * * *", () => {
  console.log("🕒 Menjalankan backup harian...");
  backupDatabase();
});

// Bisa dijalankan manual via terminal
if (process.argv.includes("--now")) {
  backupDatabase();
}

console.log("🧩 Cron backup aktif (setiap hari 03:00 UTC)");