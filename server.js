/**
 * ==========================================================
 * server.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Express API Server
 * ✅ Integrasi semua routes
 * ✅ PostgreSQL + SQLite hybrid
 * ✅ Security Headers (CSP)
 * ✅ Logger & Error Handler
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

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// 🧩 Middleware Utama
// ============================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS Configuration (izinkan frontend URL Render)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Helmet Security (termasuk CSP)
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

// Logging setiap request
app.use(morgan("tiny", { stream: logger.stream }));

// ============================================================
// 📁 Static File (Frontend)
// ============================================================
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// 🌐 Route Integrations
// ============================================================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/tours", require("./routes/tours"));
app.use("/api/sales", require("./routes/reportSales"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/executive", require("./routes/executiveReport"));
app.use("/api/users", require("./routes/users"));
app.use("/api/regions", require("./routes/regions"));
app.use("/api/logs", require("./routes/logs"));

// ============================================================
// ❤️ Health Check
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
// ⚠️ 404 Handler (jika route tidak ditemukan)
// ============================================================
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// ============================================================
// 🧯 Error Handler Global
// ============================================================
app.use(errorHandler);

// ============================================================
// 🚀 Jalankan Server + Database
// ============================================================
(async () => {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      logger.info(`🚀 Server berjalan di port ${PORT}`);
      logger.info(`🌍 Mode: ${process.env.NODE_ENV || "development"}`);
      logger.info(`📦 Database: ${process.env.DATABASE_URL ? "PostgreSQL (Neon)" : "SQLite"}`);
    });
  } catch (err) {
    logger.error("❌ Gagal menginisialisasi aplikasi:", err);
    process.exit(1);
  }
})();
