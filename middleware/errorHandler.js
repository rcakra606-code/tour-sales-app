/**
 * ==========================================================
 * middleware/errorHandler.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ Menangani semua error API secara global
 * ✅ Format JSON konsisten untuk frontend
 * ✅ Log error ke console (atau ke database jika diaktifkan)
 * ✅ Aman untuk production (tidak bocorkan stack)
 * ==========================================================
 */

const { logEvent } = require("../config/logger");

/**
 * Express Global Error Handler
 */
function errorHandler(err, req, res, next) {
  console.error("❌ [GlobalErrorHandler]", err.message);

  // Tentukan status code default
  const status = err.statusCode || 500;

  // Pesan error yang aman untuk user
  const message =
    status === 500
      ? "Terjadi kesalahan pada server. Silakan coba lagi nanti."
      : err.message;

  // Catat ke database logs (opsional)
  try {
    if (req.user) {
      logEvent(
        req.user.username,
        req.user.type,
        "Error",
        `${req.method} ${req.originalUrl} — ${err.message}`
      );
    }
  } catch (logErr) {
    console.warn("⚠️ Gagal mencatat error log:", logErr.message);
  }

  // Kirim response JSON aman
  res.status(status).json({
    success: false,
    error: message,
    code: status,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
