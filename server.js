/**
 * ==========================================================
 * server.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ Express.js backend dengan PostgreSQL (Neon)
 * ✅ Render-ready (tanpa volume / disk)
 * ✅ Helmet CSP + CORS
 * ✅ Cron backup (opsional, untuk ekspor CSV)
 * ✅ Modular route loading
 * ==========================================================
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const cron = require("node-cron");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      "img-src": ["'self'", "data:", "blob:"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Database Connection Check ---
const db = require("./config/database"); // centralized Neon connector
(async () => {
  try {
    const res = await db.query("SELECT NOW()");
    console.log("✅ PostgreSQL (Neon) Connected — Server time:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

// --- Routes Import ---
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const toursRoutes = require("./routes/tours");
const salesRoutes = require("./routes/sales");
const documentsRoutes = require("./routes/documents");
const regionsRoutes = require("./routes/regions");
const usersRoutes = require("./routes/users");
const logsRoutes = require("./routes/logs");

// --- API Routing ---
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/regions", regionsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/logs", logsRoutes);

// --- Health Check (for Render) ---
app.get("/api/health", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// --- Default Route (Frontend Fallback) ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error("❌ Internal Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// --- Optional: Cron Backup Task (manual export) ---
cron.schedule("0 3 * * *", () => {
  console.log("🕒 Scheduled maintenance task (03:00 AM) — Database is cloud-based, no local backup required.");
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Travel Dashboard Enterprise running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});
