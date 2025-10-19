/**
 * ==========================================================
 * server.js — Travel Dashboard Enterprise v3.9.4
 * ==========================================================
 * ✅ Express API Server (Production Ready)
 * ✅ Auto detect duplicate routes (sales.js / reportSales.js)
 * ✅ PostgreSQL (Neon) + SQLite fallback
 * ✅ Helmet CSP + CORS + Morgan Logging
 * ✅ Route Verification before startup
 * ✅ Error-safe startup with graceful exit
 * ==========================================================
 */

require("dotenv").config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./config/logger");
const { initDatabase, getDB } = require("./config/database");
const { errorHandler } = require("./middleware/errorHandler");
const { verifyRoutes } = require("./scripts/verify-routes");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// 🧩 1️⃣ Verifikasi semua routes sebelum server dijalankan
// ============================================================
try {
  verifyRoutes();
} catch (err) {
    logger.error("❌ Route verification failed:", err);
    process.exit(1);
}

// ============================================================
// ⚙️ 2️⃣ Middleware utama
// ============================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS — untuk koneksi frontend Render
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Helmet CSP — keamanan tambahan
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net/npm/chart.js",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://cdn.jsdelivr.net/npm",
          "https://fonts.googleapis.com",
        ],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL || "*"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Logging setiap request HTTP
app.use(morgan("tiny", { stream: logger.stream }));

// ============================================================
// 📁 3️⃣ Static File Serving
// ============================================================
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// 🧠 4️⃣ Smart Route Loader (deteksi file duplikat)
// ============================================================

/**
 * Fungsi helper untuk load route dengan fallback (misalnya sales.js vs reportSales.js)
 */
function loadRoute(primary, fallback) {
  try {
    const route = require(primary);
    logger.info(`✅ Route aktif: ${primary}`);
    return route;
  } catch (err) {
    logger.warn(`⚠️ Route utama gagal (${primary}). Mencoba fallback: ${fallback}`);
    try {
      const fallbackRoute = require(fallback);
      logger.info(`✅ Fallback route digunakan: ${fallback}`);
      return fallbackRoute;
    } catch (err2) {
      logger.error(`❌ Gagal memuat route ${primary} dan fallback ${fallback}`);
      return (req, res) => res.status(500).json({ message: "Route tidak dapat dimuat" });
    }
  }
}

// ============================================================
// 🌐 5️⃣ Daftar Routes Utama
// ============================================================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/tours", require("./routes/tours"));
app.use("/api/sales", loadRoute("./routes/sales", "./routes/reportSales"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/executive", require("./routes/executiveReport"));
app.use("/api/users", require("./routes/users"));
app.use("/api/regions", require("./routes/regions"));
app.use("/api/logs", require("./routes/logs"));

// ============================================================
// ❤️ 6️⃣ Health Check Endpoint
// ============================================================
app.get("/api/health", async (req, res) => {
  try {
    const db = getDB();
    await db.get("SELECT 1");
    res.json({ status: "ok", db: "connected", timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected", error: err.message });
  }
});

// ============================================================
// ⚠️ 7️⃣ 404 Handler
// ============================================================
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// ============================================================
// 🧯 8️⃣ Error Handler Global
// ============================================================
app.use(errorHandler);

// ============================================================
// 🚀 9️⃣ Jalankan Server + Database Initialization
// ============================================================
(async () => {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      logger.info(`🚀 Server berjalan di port ${PORT}`);
      logger.info(`🌍 Mode: ${process.env.NODE_ENV || "development"}`);
      logger.info(`📦 Database: ${process.env.DATABASE_URL ? "PostgreSQL (Neon)" : "SQLite fallback"}`);
    });
  } catch (err) {
    logger.error("❌ Gagal menginisialisasi aplikasi:", err);
    process.exit(1);
  }
})();
