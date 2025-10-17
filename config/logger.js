/**
 * ======================================
 * 🪵 LOGGER CONFIGURATION (Winston + Morgan)
 * ======================================
 */

const fs = require("fs");
const path = require("path");
const winston = require("winston");
const morgan = require("morgan");

// Pastikan folder logs tersedia
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// 🔹 Format log dengan timestamp
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

// 🔹 Inisialisasi Winston logger
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

// 🔹 Integrasi Morgan → HTTP log masuk ke Winston
const httpLogger = morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

// Ekspor keduanya
module.exports = { logger, httpLogger };
