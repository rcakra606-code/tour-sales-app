/**
 * ==========================================================
 * scripts/verify-routes.js — Travel Dashboard Enterprise v3.9.5
 * ==========================================================
 * ✅ Memeriksa semua file di folder /routes
 * ✅ Pastikan semuanya mengekspor express.Router() valid
 * ✅ Kill switch otomatis: hentikan server jika ada error
 * ✅ Logging lengkap + warna untuk Render console
 * ==========================================================
 */

const fs = require("fs");
const path = require("path");
const express = require("express");
const chalk = require("chalk");

const routesDir = path.join(__dirname, "../routes");

/**
 * Mengecek apakah suatu object adalah express.Router()
 */
function isExpressRouter(obj) {
  return (
    typeof obj === "function" &&
    typeof obj.use === "function" &&
    typeof obj.get === "function"
  );
}

/**
 * Verifikasi semua file routes
 */
function verifyRoutes() {
  console.log(chalk.cyan("\n🧩 Memeriksa semua routes di folder /routes...\n"));

  const files = fs.readdirSync(routesDir);
  let allValid = true;
  const results = [];

  for (const file of files) {
    const filePath = path.join(routesDir, file);

    // Hanya cek file JS
    if (!file.endsWith(".js")) continue;

    try {
      const mod = require(filePath);
      if (!isExpressRouter(mod)) {
        console.log(chalk.red(`❌ [INVALID] ${file} — tidak mengekspor express.Router()`));
        results.push({ file, status: "invalid" });
        allValid = false;
      } else {
        console.log(chalk.green(`✅ [OK] ${file}`));
        results.push({ file, status: "ok" });
      }
    } catch (err) {
      console.log(chalk.yellow(`💥 [ERROR] ${file} — ${err.message}`));
      results.push({ file, status: "error" });
      allValid = false;
    }
  }

  if (!allValid) {
    console.log(chalk.redBright("\n🚫 Beberapa route tidak valid. Server tidak akan dijalankan.\n"));
    console.log(chalk.gray("Periksa file di atas (kemungkinan lupa `module.exports = router;`)"));
    process.exit(1);
  }

  console.log(chalk.greenBright("\n✅ Semua routes valid! Lanjutkan ke server startup...\n"));
  return results;
}

// Jalankan langsung jika dipanggil manual
if (require.main === module) {
  verifyRoutes();
}

module.exports = { verifyRoutes };
