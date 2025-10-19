/**
 * ==========================================================
 * 📁 config/logger.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Logger konfigurasi utama untuk server:
 * - Menggunakan Winston (dari utils/logger.js)
 * - Menangani log startup, koneksi DB, dan error global
 * ==========================================================
 */

import { createLogger, format, transports } from "winston";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log("📁 Folder logs dibuat:", logDir);
}

// Format log konsisten untuk file & console
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Konfigurasi logger global
const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({ filename: path.join(logDir, "app.log") }),
    new transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
  ],
});

// 🧩 Helper export
export const logInfo = (msg) => logger.info(msg);
export const logWarn = (msg) => logger.warn(msg);
export const logError = (msg) => logger.error(msg);

export default logger;