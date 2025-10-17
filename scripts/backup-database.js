// ============================================================
// scripts/backup-database.js — Travel Dashboard Enterprise v2.1
// ============================================================

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

console.log(chalk.cyan("💾 Starting database backup..."));

const dbPath = path.join(__dirname, "..", "data", "database.sqlite");
const backupDir = path.join(__dirname, "..", "backups");

// 1️⃣ Pastikan folder backups/ ada
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(chalk.yellow(`📁 Created backup directory: ${backupDir}`));
}

// 2️⃣ Pastikan file database ada
if (!fs.existsSync(dbPath)) {
  console.error(chalk.red("❌ Database file not found. Cannot create backup."));
  process.exit(1);
}

// 3️⃣ Buat nama file backup
const timestamp = new Date().toISOString().split("T")[0];
const backupFile = path.join(backupDir, `backup_${timestamp}.sqlite`);

// 4️⃣ Copy database ke folder backup
try {
  fs.copyFileSync(dbPath, backupFile);
  const sizeKB = (fs.statSync(dbPath).size / 1024).toFixed(2);
  console.log(chalk.green(`✅ Backup created: ${backupFile} (${sizeKB} KB)`));
} catch (err) {
  console.error(chalk.red("❌ Backup failed:"), err.message);
  process.exit(1);
}

console.log(chalk.cyan("🎉 Database backup completed successfully!\n"));
