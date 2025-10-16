/**
 * ✅ LOGGER CONFIGURATION
 * Menggunakan Winston untuk logging + Morgan untuk HTTP request log
 */

const fs = require("fs");
const path = require("path");
const winston = require("winston");
const morgan = require("morgan");

// === Pastikan folder log ada ===
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// === Format log ===
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

// === Winston instance ===
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "app.log"),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
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

// === Morgan (HTTP request logger) ===
const httpLogger = morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

module.exports = {
  logger,
  httpLogger,
};
