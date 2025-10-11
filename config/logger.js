/**
 * ✅ LOGGER CONFIGURATION
 * Menggunakan winston untuk logging + morgan untuk HTTP request log
 */

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const morgan = require('morgan');

// Buat folder logs jika belum ada
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// ================================
// ✅ Winston Logger setup
// ================================
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Simpan ke file
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    // Tampilkan di console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// ================================
// ✅ Morgan (HTTP request logger)
// ================================
const httpLogger = morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

// ================================
// ✅ Export
// ================================
module.exports = { logger, httpLogger };
