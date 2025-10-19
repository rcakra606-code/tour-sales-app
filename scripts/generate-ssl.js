/**
 * ==========================================================
 * 📁 scripts/generate-ssl.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Membuat sertifikat self-signed SSL untuk environment lokal
 * agar pengujian HTTPS dan CSP dapat dilakukan tanpa error.
 * ==========================================================
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const SSL_DIR = path.resolve("./ssl");
const KEY_FILE = path.join(SSL_DIR, "server.key");
const CERT_FILE = path.join(SSL_DIR, "server.crt");

// Pastikan folder tersedia
if (!fs.existsSync(SSL_DIR)) {
  fs.mkdirSync(SSL_DIR, { recursive: true });
  console.log("📁 Folder SSL dibuat:", SSL_DIR);
}

// Jika sudah ada file, tidak perlu dibuat ulang
if (fs.existsSync(KEY_FILE) && fs.existsSync(CERT_FILE)) {
  console.log("✅ Sertifikat SSL sudah ada, tidak perlu dibuat ulang.");
  process.exit(0);
}

try {
  console.log("🔧 Membuat sertifikat self-signed SSL...");

  const cmd = `
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ${KEY_FILE} -out ${CERT_FILE} \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=TravelDashboard/OU=Dev/CN=localhost"
  `;

  execSync(cmd, { stdio: "inherit" });

  console.log("✅ Sertifikat SSL berhasil dibuat!");
  console.log("📂 Key:", KEY_FILE);
  console.log("📂 Cert:", CERT_FILE);
} catch (err) {
  console.error("❌ Gagal membuat sertifikat SSL:", err.message);
}