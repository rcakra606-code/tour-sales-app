/**
 * ==========================================================
 * server.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ Express.js + PostgreSQL (Neon)
 * ✅ Wait for DB connection before starting
 * ✅ Secure headers via Helmet (CSP)
 * ✅ Modular routes
 * ✅ Global error handler
 * ✅ Static frontend (login + dashboard)
 * ==========================================================
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const cron = require("node-cron");
require("dotenv").config();

const db = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================
// 🔒 Security Middleware
// =========================================
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],
        "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        "img-src": ["'self'", "data:", "blob:"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })
);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// =========================================
// 🧠 Routes Import
// =========================================
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const toursRoutes = require("./routes/tours");
const salesRoutes = require("./routes/sales");
const documentsRoutes = require("./routes/documents");
const regionsRoutes = require("./routes/regions");
const usersRoutes = require("./routes/users");
const logsRoutes = require("./routes/logs");

// =========================================
// 🧭 Route Definitions
// =========================================
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/regions", regionsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/logs", logsRoutes);

// =========================================
// 🩺 Health Check Endpoint (Render ping)
// =========================================
app.get("/api/health", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// =========================================
// 🔐 Root Redirect (Public Entry Point)
// =========================================
// Default behavior: redirect to login.html if no token found
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// =========================================
// 🧹 Global Error Handler
// =========================================
app.use(errorHandler);

// =========================================
// 🕒 Optional: Scheduled Maintenance (Logging / Backups)
// =========================================
cron.schedule("0 3 * * *", () => {
  console.log("🕒 Scheduled task 03:00 — maintenance running...");
});

// =========================================
// 🚀 Start Server (Wait for DB Ready)
// =========================================
(async () => {
  console.log("⏳ Checking PostgreSQL connection...");
  const ok = await db.verifyConnection(5, 3000);
  if (!ok) {
    console.error("❌ Database connection failed. Exiting...");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`✅ Database connected successfully`);
    console.log(`🚀 Travel Dashboard Enterprise running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  });
})();
