/**
 * ==========================================================
 * 📁 middleware/log.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Middleware logging aktivitas request ke server.
 * ==========================================================
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastikan folder logs tersedia
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log("📁 Folder logs dibuat:", logDir);
}

const logFile = path.join(logDir, "access.log");

/**
 * 📝 Request Logger Middleware
 * Menulis setiap request ke file logs/access.log
 */
export const requestLogger = (req, res, next) => {
  const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.ip}\n`;

  fs.appendFile(logFile, logEntry, (err) => {
    if (err) console.error("❌ Gagal menulis log:", err.message);
  });

  next();
};