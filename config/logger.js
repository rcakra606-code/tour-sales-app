/**
 * ✅ Advanced Logger Configuration
 * Menggunakan Winston + Morgan untuk logging terstruktur.
 * Dilengkapi fallback agar tidak menyebabkan error bila dipanggil dari module lain.
 */

const fs = require("fs");
const path = require("path");
const winston = require("winston");
const morgan = require("morgan");

// === Folder Logs ===
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// === Format ===
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

// === Winston Logger ===
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "app.log"),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// === Tambahkan fallback sederhana agar tidak error ===
["info", "warn", "error", "debug"].forEach((method) => {
  if (typeof logger[method] !== "function") {
    logger[method] = (...args) => console.log(`[${method.toUpperCase()}]`, ...args);
  }
});

// === Morgan HTTP Logger ===
const httpLogger = morgan("combined", {
  stream: { write: (msg) => logger.info(msg.trim()) },
});

module.exports = { logger, httpLogger };
