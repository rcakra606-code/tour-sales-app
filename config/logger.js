const winston = require('winston');
const path = require('path');
const fs = require('fs');
const DailyRotateFile = require('winston-daily-rotate-file');
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length) msg += ' ' + JSON.stringify(meta);
    return msg;
  })
);

const transports = [];
if (process.env.NODE_ENV !== 'production') transports.push(new winston.transports.Console({ format: consoleFormat, level: 'debug' }));

transports.push(new DailyRotateFile({
  filename: path.join(logsDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
  format: logFormat
}));

transports.push(new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: logFormat
}));

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exceptionHandlers: [ new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') }) ],
  rejectionHandlers: [ new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') }) ]
});

const httpLogger = (req, res, next) => {
  const start = Date.now();
  logger.info('HTTP START', { method: req.method, url: req.url, ip: req.ip });
  const origEnd = res.end;
  res.end = function(chunk, enc) {
    const dur = Date.now() - start;
    logger.info('HTTP END', { method: req.method, url: req.url, statusCode: res.statusCode, duration: dur + 'ms' });
    origEnd.call(this, chunk, enc);
  };
  next();
};

module.exports = { logger, httpLogger };
