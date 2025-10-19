/**
 * ==========================================================
 * server.js — Travel Dashboard Enterprise v3.9.8
 * ==========================================================
 * 🧩 Build diagnostik untuk mendeteksi route non-middleware
 * ✅ Menampilkan tipe ekspor tiap route di log
 * ✅ Melanjutkan startup meskipun 1 route error
 * ==========================================================
 */

require("dotenv").config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const logger = require("./config/logger");
const { initDatabase, getDB } = require("./config/database");
const { errorHandler } = require("./middleware/errorHandler");
const { verifyRoutes } = require("./scripts/verify-routes");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// 🧠 1️⃣ Verifikasi route sebelum start
// ============================================================
try {
  verifyRoutes();
} catch (err) {
  logger.error("❌ Route verification failed:", err);
  process.exit(1);
}

// ============================================================
// ⚙️ 2️⃣ Middleware dasar
// ============================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(morgan("tiny", { stream: logger.stream }));

// Helmet CSP
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ============================================================
// 🧩 3️⃣ Fungsi debug route
// ============================================================
function loadRouteSafely(routePath) {
  const absolute = path.join(__dirname, routePath);
  try {
    const mod = require(absolute);
    const isValid =
      mod && (typeof mod === "function" || typeof mod.use === "function");
    const isESM =
      mod &&
      mod.default &&
      (typeof mod.default === "function" ||
        typeof mod.default.use === "function");

    console.log(
      "🔍 Route check:",
      routePath,
      {
        exists: fs.existsSync(absolute),
        type: typeof mod,
        keys: Object.keys(mod || {}),
        hasUse: typeof mod?.use,
        hasDefault: !!mod?.default,
        defaultType: typeof mod?.default,
      }
    );

    if (isValid) return mod;
    if (isESM) return mod.default;

    console.warn(
      `⚠️ Route ${routePath} tidak valid (skip sementara agar server bisa start).`
    );
    return (req, res) =>
      res.status(500).json({
        message: `Route ${routePath} invalid, lihat log startup untuk detail.`,
      });
  } catch (err) {
    console.error(`💥 Gagal memuat route ${routePath}:`, err.message);
    return (req, res) =>
      res.status(500).json({ message: `Gagal load ${routePath}` });
  }
}

// ============================================================
// 🌐 4️⃣ Register semua routes
// ============================================================
app.use("/api/auth", loadRouteSafely("./routes/auth"));
app.use("/api/dashboard", loadRouteSafely("./routes/dashboard"));
app.use("/api/tours", loadRouteSafely("./routes/tours"));
app.use("/api/sales", loadRouteSafely("./routes/sales"));
app.use("/api/documents", loadRouteSafely("./routes/documents"));
app.use("/api/executive", loadRouteSafely("./routes/executiveReport"));
app.use("/api/users", loadRouteSafely("./routes/users"));
app.use("/api/regions", loadRouteSafely("./routes/regions"));
app.use("/api/logs", loadRouteSafely("./routes/logs"));

// ============================================================
// ❤️ Health check
// ============================================================
app.get("/api/health", async (req, res) => {
  try {
    const db = getDB();
    await db.get("SELECT 1");
    res.json({ status: "ok", db: "connected", port: PORT });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// ============================================================
// ⚠️ 404 dan Error handler
// ============================================================
app.use((req, res) => res.status(404).json({ message: "Endpoint tidak ditemukan" }));
app.use(errorHandler);

// ============================================================
// 🚀 Jalankan server
// ============================================================
(async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      logger.info(`🚀 Server berjalan di port ${PORT}`);
      logger.info(`🌍 Mode: ${process.env.NODE_ENV || "development"}`);
      logger.info(
        `📦 Database: ${
          process.env.DATABASE_URL ? "PostgreSQL (Neon)" : "SQLite fallback"
        }`
      );
      console.log("===========================================");
      console.log("📂 Routes terdaftar:", fs.readdirSync(path.join(__dirname, "routes")));
      console.log("===========================================");
    });
  } catch (err) {
    logger.error("❌ Startup error:", err);
    process.exit(1);
  }
})();
