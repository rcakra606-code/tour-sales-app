/**
 * ============================================
 * 🚀 TOUR & SALES MANAGEMENT DASHBOARD SERVER
 * ============================================
 * Fitur:
 * - Secure Helmet + CORS
 * - Auto load route API
 * - Static frontend (public/)
 * - JWT Auth middleware
 * - Winston logger + Morgan request log
 * - SQLite via better-sqlite3
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const { logger, httpLogger } = require("./config/logger");

// === Inisialisasi database ===
require("./config/database");

const app = express();

// =============================
// ✅ Middleware Global
// =============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(httpLogger);

// === Helmet CSP (mengizinkan CDN umum)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// =============================
// ✅ Routes Import
// =============================
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const salesRoutes = require("./routes/sales");
const toursRoutes = require("./routes/tours");
const usersRoutes = require("./routes/users");
// (hapus documents karena sudah tidak dipakai)
// const documentsRoutes = require("./routes/documents");
const regionsRoutes = require("./routes/regions");

// =============================
// ✅ Serve Frontend Static Files
// =============================
app.use(express.static(path.join(__dirname, "public")));

// =============================
// ✅ API Routes
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/regions", regionsRoutes);

// =============================
// ✅ Healthcheck
// =============================
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// =============================
// ✅ SPA Fallback (Frontend Routes)
// =============================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =============================
// ✅ Jalankan Server
// =============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  console.log(`✅ Server running on port ${PORT}`);
});
