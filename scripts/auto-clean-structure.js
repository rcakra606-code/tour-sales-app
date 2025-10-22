// ==========================================================
// 🧹 Auto Clean & Sync Project Structure
// ==========================================================
// Membersihkan file lama & menyiapkan struktur final
// Travel Dashboard Enterprise v5.4.8
// ==========================================================

import fs from "fs";
import path from "path";

const projectRoot = process.cwd();

// Helper delete
function safeDelete(filePath) {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { recursive: true, force: true });
    console.log(`🗑️  Removed: ${filePath}`);
  }
}

// ==========================================================
// 1️⃣ FILE / FOLDER YANG AKAN DIHAPUS (redundan atau lama)
// ==========================================================
const obsolete = [
  "config/logger.js",
  "config/production.js",
  "middleware/auth.js",
  "middleware/log.js",
  "public/css/sidebar.css",
  "public/js/sidebar.js",
  "public/js/theme.js",
  "public/js/loader.js",
  "public/js/logout.js",
  "public/partials",
  "public/sidebar.html",
  "scripts/auto-repair-deploy.sh",
  "scripts/init-db.js",
  "scripts/initDatabase.sql",
  "scripts/migrate-add-username-type.js",
  "scripts/migrateDatabase.js",
  "scripts/fix-admin.js",
  "scripts/fix-users-table.js",
  "scripts/setup-test-users.js",
  "scripts/test-db.js",
  "scripts/test-email.js",
  "scripts/setup-ssl.sh",
  "scripts/generate-ssl.js",
  "scripts/setup-cron.js",
  "scripts/update-schema.sql",
  "deploy.sh",
  "setup.sh"
];

// ==========================================================
// 2️⃣ STRUKTUR FOLDER WAJIB DIPERTAHANKAN
// ==========================================================
const requiredDirs = [
  "config",
  "controllers",
  "middleware",
  "public/css",
  "public/js",
  "routes",
  "scripts",
  "utils"
];

requiredDirs.forEach((dir) => {
  const fullPath = path.join(projectRoot, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Created: ${dir}`);
  }
});

// ==========================================================
// 3️⃣ HAPUS FILE REDUNDAN
// ==========================================================
obsolete.forEach((file) => {
  const filePath = path.join(projectRoot, file);
  safeDelete(filePath);
});

// ==========================================================
// 4️⃣ CEK FILE WAJIB
// ==========================================================
const mustHave = [
  "server.js",
  "package.json",
  "render.yaml",
  "Dockerfile",
  ".env",
  "controllers/authController.js",
  "scripts/initDatabase.js",
  "scripts/setup-admin.js"
];

const missing = mustHave.filter((f) => !fs.existsSync(path.join(projectRoot, f)));

if (missing.length > 0) {
  console.log("⚠️  Warning: Missing essential files:");
  missing.forEach((m) => console.log(`   ❌ ${m}`));
} else {
  console.log("✅ All essential files are present.");
}

console.log("\n✨ Structure cleaned and synced successfully!");