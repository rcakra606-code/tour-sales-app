/**
 * ✅ LOGGER CONFIGURATION (Final Version)
 * Menggunakan Winston untuk logging utama + Morgan untuk HTTP request logging
 */

const fs = require("fs");
const path = require("path");
const winston = require("winston");
const morgan = require("morgan");

// === Pastikan folder logs tersedia ===
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// === Winston logger ===
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

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

// === Morgan HTTP Logger ===
const httpLogger = morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

// === Ekspor keduanya ===
// Default export → langsung instance `logger`
// Named export → jika butuh middleware Morgan di server.js
module.exports = logger;
module.exports.httpLogger = httpLogger;
