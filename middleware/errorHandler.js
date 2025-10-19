/**
 * ==========================================================
 * 📁 middleware/errorHandler.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Middleware global untuk menangani error server.
 * ==========================================================
 */

/**
 * 💥 Error Handler Middleware
 * Menangkap error global dan mencegah server crash.
 */
export const errorHandler = (err, req, res, next) => {
  console.error("💥 Server error:", err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Terjadi kesalahan pada server.";

  res.status(statusCode).json({
    status: "error",
    message,
  });
};