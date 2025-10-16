/**
 * ✅ Database Check & Auto-Initialization Script
 * Membuat tabel hilang + akun admin default (admin / admin123)
 */

const db = require("../config/database");
const bcrypt = require("bcryptjs");
const { logger } = require("../config/logger");

function ensureTables() {
  const tables = ["users", "tours", "sales", "regions"];
  const missing = [];

  for (const t of tables) {
    const check = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
    ).get(t);
    if (!check) missing.push(t);
  }

  if (missing.length > 0) {
    logger.warn(`⚠️  Missing tables detected: ${missing.join(", ")}`);
    logger.info("Creating missing tables...");

    // Jalankan ulang inisialisasi tabel (karena database.js menanganinya)
    require("../config/database");

    logger.info("✅ All missing tables have been created successfully.");
  } else {
    logger.info("✅ All tables already exist.");
  }
}

function ensureAdminUser() {
  const admin = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
  if (!admin) {
    const hashed = bcrypt.hashSync("admin123", 10);
    db.prepare(
      "INSERT INTO users (name, username, email, password, role, type) VALUES (?,?,?,?,?,?)"
    ).run("Administrator", "admin", "admin@example.com", hashed, "admin", "super");
    logger.info("👤 Default admin user created: admin / admin123");
  } else {
    logger.info("✅ Admin account already exists");
  }
}

try {
  ensureTables();
  ensureAdminUser();
} catch (err) {
  logger.error("❌ Database check failed:", err);
  process.exit(1);
}
