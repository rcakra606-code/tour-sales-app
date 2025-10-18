// ============================================================
// scripts/check-db.js — Travel Dashboard Enterprise v2.3
// ============================================================

const fs = require("fs");
const path = require("path");

console.log("🔍 Checking Travel Dashboard database status...");

const dbPath = path.join(__dirname, "..", "data", "database.sqlite");
const dbDir = path.dirname(dbPath);

// 1️⃣ Pastikan folder data/ ada
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`📁 Created directory: ${dbDir}`);
}

// 2️⃣ Cek file database
if (!fs.existsSync(dbPath)) {
  console.log("⚠️ Database file not found!");
  console.log("💡 Running initDatabase.js to create a new database...");

  try {
    // Jalankan inisialisasi database otomatis
    require("./initDatabase.js");
    console.log("✅ Database successfully initialized.");
  } catch (err) {
    console.error("❌ Failed to initialize database:", err.message);
    process.exit(1);
  }
} else {
  // Jika sudah ada, tampilkan ukuran file database
  const stats = fs.statSync(dbPath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`✅ Database found: ${dbPath} (${sizeKB} KB)`);
}

console.log("🟢 Database check completed successfully!\n");
