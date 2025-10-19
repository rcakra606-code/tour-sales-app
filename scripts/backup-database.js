/**
 * ==========================================================
 * 📁 scripts/backup-database.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Membuat snapshot backup manual NeonDB (PostgreSQL)
 * dan menghapus backup yang berumur >30 hari secara otomatis.
 * ==========================================================
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const BACKUP_DIR = path.resolve("./backups");
const RETENTION_DAYS = 30;

// Pastikan folder backup tersedia
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log("📁 Folder backup dibuat:", BACKUP_DIR);
}

function cleanupOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();

  files.forEach((file) => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

    if (ageInDays > RETENTION_DAYS) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Menghapus backup lama: ${file}`);
    }
  });
}

async function createBackup() {
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL tidak ditemukan di .env");
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `backup-${timestamp}.sql`;
  const filePath = path.join(BACKUP_DIR, fileName);

  console.log(`⏳ Membuat backup database: ${fileName}`);

  const command = `pg_dump "${DATABASE_URL}" --no-owner --no-acl > "${filePath}"`;

  exec(command, (err) => {
    if (err) {
      console.error("❌ Gagal membuat backup:", err.message);
    } else {
      console.log(`✅ Backup selesai: ${fileName}`);
      cleanupOldBackups();
    }
  });
}

createBackup();