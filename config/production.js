/**
 * ==========================================================
 * 📁 config/production.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Konfigurasi middleware keamanan & performa untuk mode production:
 * - Helmet (CSP + headers keamanan)
 * - Compression (gzip)
 * - Rate Limiter (mencegah brute force)
 * ==========================================================
 */

import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

/**
 * ⚙️ Fungsi konfigurasi production
 * @param {Express} app - instance dari express()
 */
export const configureProduction = (app) => {
  console.log("🛡️  Mengaktifkan mode Production Security...");

  // ✅ Middleware keamanan dasar
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "cdn.jsdelivr.net", "res.cloudinary.com"],
        connectSrc: ["'self'", "https://travel-dashboard.onrender.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
      },
    },
  }));

  // ✅ Kompresi untuk mempercepat loading
  app.use(compression());

  // ✅ Rate limiter (maks 100 request / 15 menit per IP)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100,
    message: {
      status: "error",
      message: "Terlalu banyak permintaan dari IP ini, coba lagi nanti.",
    },
  });
  app.use(limiter);

  console.log("✅ Production security & optimization aktif.");
};