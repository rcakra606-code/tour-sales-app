// ==========================
// ✅ config/logger.js
// ==========================

const morgan = require('morgan');

// Logger sederhana ke console
const logger = {
  info: (...args) => console.log('ℹ️', ...args),
  warn: (...args) => console.warn('⚠️', ...args),
  error: (...args) => console.error('❌', ...args),
};

// Middleware HTTP logger (gunakan morgan)
const httpLogger = morgan('dev');

module.exports = { logger, httpLogger };
