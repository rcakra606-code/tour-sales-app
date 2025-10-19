/**
 * ==========================================================
 * server.js — Travel Dashboard Enterprise v3.9.7
 * ==========================================================
 * ✅ Express API Server (Production Ready)
 * ✅ PostgreSQL (Neon) + SQLite fallback
 * ✅ Auto Route Verification + Smart Import Handler
 * ✅ Helmet CSP + CORS + Morgan Logging
 * ✅ Graceful Error Handling
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
// 🧩 1️⃣ Verifikasi Routes Sebelum Server Jalan
// ============================================================
try {
  verifyRoutes();
} catch (err) {
  logger.error("❌ Route verification failed:", err);
  process.exit(1);
}

// ============================================================
// ⚙️ 2️⃣ Middleware Utama
// ============================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS — izinkan frontend Render
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Helmet CSP untuk keamanan
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

// Morgan logging
app.use(morgan("tiny", { stream: logger.stream }));

// ============================================================
// 📁 3️⃣ Static File Serving
// ============================================================
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// 🌐 4️⃣ Safe Route Loader (Smart Import Handler)
// ============================================================
function safeLoadRoute(routePath) {
  try {
    const mod = require(routePath);

    // CommonJS export
    if (typeof mod === "function" && typeof mod.use === "function") {
      logger.info(`✅ Route aktif: ${routePath} (CommonJS)`);
      return mod;
    }

    // ESM default export
    if (
      mod &&
      mod.default &&
      (typeof mod.default === "function" || typeof mod.default.use === "function")
    ) {
      logger.info(`✅ Route aktif: ${routePath} (ESM default)`);
      return mod.default;
    }

    // Invalid route
    logger.error(`❌ Route ${routePath} tidak mengembalikan express.Router() valid.`);
    logger.error(`⚠️ Type: ${typeof mod}, keys: ${Object.keys(mod || {})}`);
    throw new TypeError(`Route ${routePath} invalid — bukan express.Router()`);
  } catch (err) {
    logger.error(`💥 Gagal memuat route ${routePath}: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================
// 🚀 5️⃣ Register Routes
// ============================================================
app.use("/api/auth", safeLoadRoute("./routes/auth"));
app.use("/api/dashboard", safeLoadRoute("./routes/dashboard"));
app.use("/api/tours", safeLoadRoute("./routes/tours"));
app.use("/api/sales", safeLoadRoute("./routes/sales")); // ✅ fix safe load
app.use("/api/documents", safeLoadRoute("./routes/documents"));
app.use("/api/executive", safeLoadRoute("./routes/executiveReport"));
app.use("/api/users", safeLoadRoute("./routes/users"));
app.use("/api/regions", safeLoadRoute("./routes/regions"));
app.use("/api/logs", safeLoadRoute("./routes/logs"));

// ============================================================
// ❤️ 6️⃣ Health Check Endpoint
// ============================================================
app.get("/api/health", async (req, res) => {
  try {
    const db = getDB();
    await db.get("SELECT 1");
    res.json({
      status: "ok",
      db: "connected",
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
      port: PORT,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      db: "disconnected",
      error: err.message,
    });
  }
});

// ============================================================
// ⚠️ 7️⃣ 404 Handler
// ============================================================
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// ============================================================
// 🧯 8️⃣ Global Error Handler
// ============================================================
app.use(errorHandler);

// ============================================================
// 🚀 9️⃣ Start Server + Init Database
// ============================================================
(async () => {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      const envLabel = process.env.RENDER ? "Render" : "Local";
      logger.info(`🚀 Server berjalan di port ${PORT} [${envLabel}]`);
      logger.info(`🌍 Mode: ${process.env.NODE_ENV || "development"}`);
      logger.info(
        `📦 Database: ${
          process.env.DATABASE_URL ? "PostgreSQL (Neon)" : "SQLite fallback"
        }`
      );
    });
  } catch (err) {
    logger.error("❌ Gagal menginisialisasi aplikasi:", err);
    process.exit(1);
  }
})();
