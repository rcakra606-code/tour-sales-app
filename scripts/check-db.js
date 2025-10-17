// ============================================================
// scripts/check-db.js — Travel Dashboard Enterprise v2.1
// ============================================================

// jalankan dengan node --experimental-modules jika error require
import fs from "fs";
import path from "path";
import chalk from "chalk";

console.log(chalk.cyan("🔍 Checking Travel Dashboard database status..."));

const dbPath = path.join(__dirname, "..", "data", "database.sqlite");
const dbDir = path.dirname(dbPath);

// 1️⃣ Pastikan folder data/ ada
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(chalk.yellow(`📁 Created directory: ${dbDir}`));
}

// 2️⃣ Cek file database
if (!fs.existsSync(dbPath)) {
  console.log(chalk.red("⚠️ Database file not found!"));
  console.log(chalk.yellow("💡 Running initDatabase.js to create a new database..."));

  try {
    require("./initDatabase.js");
    console.log(chalk.green("✅ Database successfully initialized."));
  } catch (err) {
    console.error(chalk.red("❌ Failed to initialize database:"), err.message);
    process.exit(1);
  }
} else {
  const stats = fs.statSync(dbPath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(chalk.green(`✅ Database found: ${dbPath} (${sizeKB} KB)`));
}

console.log(chalk.cyan("🟢 Database check completed successfully!\n"));
