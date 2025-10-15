// scripts/backup-database.js
const fs = require("fs");
const path = require("path");

const dbFile = path.join(__dirname, "../data/database.sqlite");
const backupDir = path.join(__dirname, "../backups");

// Pastikan folder backup ada
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupFile = path.join(backupDir, `backup-${timestamp}.sqlite`);

try {
  fs.copyFileSync(dbFile, backupFile);
  console.log(`✅ Database backup created: ${backupFile}`);
} catch (err) {
  console.error("❌ Backup failed:", err.message);
}
