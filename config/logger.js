/**
 * ==========================================================
 * config/logger.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Logging multi-level (info, warn, error)
 * ✅ Output ke file & console
 * ✅ Format waktu lokal + warna terminal
 * ✅ Siap untuk Render & Neon PostgreSQL
 * ==========================================================
 */

const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs");

// Pastikan folder log ada
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// ============================================================
// 🧠 Format log
// ============================================================
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf((info) => {
    const { timestamp, level, message } = info;
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  })
);

// ============================================================
// 🧩 Logger utama
// ============================================================
const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    // Simpan log harian
    new transports.File({
      filename: path.join(logDir, "app.log"),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 10,
      tailable: true,
    }),

    // Tampilkan ke console (untuk debugging & Render logs)
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message }) => `[${level.toUpperCase()}] ${message}`)
      ),
    }),
  ],
});

// ============================================================
// 🧾 Helper untuk log shortcut
// ============================================================
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
