// ===============================
// ✅ Simple Winston Logger
// ===============================
const winston = require('winston');
const expressWinston = require('express-winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
  ),
  transports: [new winston.transports.Console()],
});

const httpLogger = expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: false,
  msg: '{{req.method}} {{req.url}} {{res.statusCode}} - {{res.responseTime}}ms',
  colorize: true,
});

module.exports = { logger, httpLogger };
