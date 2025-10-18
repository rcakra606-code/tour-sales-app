/**
 * ==========================================================
 * 🌐 server.js — Travel Dashboard Enterprise v3.0 (Final Build)
 * ==========================================================
 * Express + SQLite + JWT + Helmet + Backup + Healthcheck
 * ----------------------------------------------------------
 * Features:
 * ✅ JWT Auth + RBAC
 * ✅ CSP Secure + CORS
 * ✅ Realtime Notification + Audit Logging
 * ✅ SQLite Auto Init
 * ✅ Healthcheck Endpoint
 * ✅ Daily Auto Backup @ 03:00 (Asia/Jakarta)
 * ==========================================================
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const { execSync } = require("child_process");
const { initDB } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const TZ = process.env.TZ || "Asia/Jakarta";

// Paths
const DATA_DIR = path.join(__dirname, "data");
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, "backups");
const DB_FILE = process.env.DB_PATH || path.join(DATA_DIR, "travel.db");

/* =====================================================
   🔒 SECURITY & CORE MIDDLEWARE
   ===================================================== */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(bodyParser.json());

/* =====================================================
   📁 INIT DATABASE & DIRECTORIES
   ===================================================== */
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

initDB(); // Ensure DB schema ready

/* =====================================================
   🗂️ ROUTES
   ===================================================== */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/tours", require("./routes/tours"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/users", require("./routes/users"));
app.use("/api/regions", require("./routes/regions"));
app.use("/api/logs", require("./routes/logs"));

/* =====================================================
   🧠 HEALTHCHECK ENDPOINT
   ===================================================== */
app.get("/api/health", (req, res) => {
  try {
    const exists = fs.existsSync(DB_FILE);
    res.json({
      status: "ok",
      database: exists ? "connected" : "missing",
      time: new Date().toLocaleString("id-ID", { timeZone: TZ }),
      version: "3.0",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/* =====================================================
   🌙 DAILY BACKUP JOB (03:00)
   ===================================================== */
cron.schedule("0 3 * * *", () => {
  try {
    const date = new Date().toISOString().split("T")[0];
    const backupFile = path.join(BACKUP_DIR, `backup-${date}.db`);
    if (fs.existsSync(DB_FILE)) {
      fs.copyFileSync(DB_FILE, backupFile);
      console.log(`🗄️ Backup created: ${backupFile}`);
    }
  } catch (err) {
    console.error("❌ Backup failed:", err.message);
  }
}, { timezone: TZ });

/* =====================================================
   📦 STATIC FRONTEND
   ===================================================== */
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);

app.get("/dashboard.html", (_, res) =>
  res.sendFile(path.join(__dirname, "public", "dashboard.html"))
);

/* =====================================================
   ⚠️ ERROR HANDLER
   ===================================================== */
app.use((err, req, res, next) => {
  console.error("❌ Uncaught Error:", err);
  res.status(500).json({ error: "Terjadi kesalahan internal server" });
});

/* =====================================================
   🚀 START SERVER
   ===================================================== */
app.listen(PORT, () => {
  console.log("==========================================");
  console.log("🚀 Travel Dashboard Enterprise v3.0 Ready");
  console.log(`🌍 Environment  : ${process.env.NODE_ENV || "development"}`);
  console.log(`🕓 Timezone     : ${TZ}`);
  console.log(`💾 Database     : ${DB_FILE}`);
  console.log(`📦 Backup Dir   : ${BACKUP_DIR}`);
  console.log(`📡 Server Port  : ${PORT}`);
  console.log("==========================================");
});
