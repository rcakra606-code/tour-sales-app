// ===================================
// ✅ Logger Configuration (Root-safe)
// ===================================

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const morgan = require('morgan');

// Pastikan folder logs ada di root project
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Format waktu dan log
const timestampFormat = winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });
const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`;
});

// ==============================
// ✅ Winston Logger
// ==============================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(timestampFormat, logFormat),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        timestampFormat,
        logFormat
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});

// ==============================
// ✅ Morgan Middleware
// ==============================
const httpLogger = morgan('tiny', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});

// Export
module.exports = { logger, httpLogger };
