/**
 * ==========================================================
 * 📁 utils/logger.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Logger terpusat berbasis Winston:
 * - Menyimpan log ke file & console
 * - Format JSON dengan timestamp
 * - Level: info, warn, error
 * ==========================================================
 */

import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Buat folder logs jika belum ada
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log("📁 Folder logs dibuat:", logDir);
}

// Konfigurasi format log
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    ({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
  )
);

// Transport: menulis log ke file & console
const transports = [
  new winston.transports.Console({
    level: "info",
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  new winston.transports.File({
    filename: path.join(logDir, "app.log"),
    level: "info",
    format: logFormat,
  }),
  new winston.transports.File({
    filename: path.join(logDir, "error.log"),
    level: "error",
    format: logFormat,
  }),
];

// Inisialisasi logger
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports,
});

// Tambahan helper
export const logInfo = (msg) => logger.info(msg);
export const logWarn = (msg) => logger.warn(msg);
export const logError = (msg) => logger.error(msg);

logger.info("✅ Winston logger aktif — menulis ke /logs/app.log");