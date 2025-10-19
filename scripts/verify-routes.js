/**
 * ==========================================================
 * scripts/verify-routes.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Memverifikasi semua file di folder /routes
 * ✅ Pastikan semuanya ekspor express.Router() valid
 * ✅ Tampilkan laporan sebelum server dijalankan
 * ==========================================================
 */

const fs = require("fs");
const path = require("path");
const express = require("express");

const routesDir = path.join(__dirname, "../routes");

function isExpressRouter(obj) {
  return (
    typeof obj === "function" &&
    typeof obj.use === "function" &&
    typeof obj.get === "function"
  );
}

function verifyRoutes() {
  console.log("🧩 Memeriksa semua routes di folder /routes...\n");

  const files = fs.readdirSync(routesDir);
  let allValid = true;

  for (const file of files) {
    const filePath = path.join(routesDir, file);
    try {
      const mod = require(filePath);
      if (!isExpressRouter(mod)) {
        console.error(`❌ [INVALID] ${file} — tidak mengekspor express.Router()`);
        allValid = false;
      } else {
        console.log(`✅ [OK] ${file}`);
      }
    } catch (err) {
      console.error(`💥 [ERROR] ${file} — ${err.message}`);
      allValid = false;
    }
  }

  if (!allValid) {
    console.error("\n🚫 Beberapa route tidak valid. Periksa file di atas sebelum menjalankan server.\n");
    process.exit(1);
  } else {
    console.log("\n✅ Semua routes valid! Lanjutkan ke server startup...\n");
  }
}

if (require.main === module) {
  verifyRoutes();
}

module.exports = { verifyRoutes };
