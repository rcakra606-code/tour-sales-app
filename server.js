// =========================================================
// server.js — Travel Dashboard Enterprise v2.1 (SECURE)
// =========================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const nodeCron = require("node-cron");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

// =========================================================
// 🧱 DATABASE INITIALIZATION
// =========================================================
const dbPath = path.join(__dirname, "data", "database.sqlite");
if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
console.log(`[${new Date().toISOString()}] ✅ Database connected: ${dbPath}`);

// =========================================================
// ⚙️ MIDDLEWARE SETUP
// =========================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Allow frontend & backend connection
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Helmet (secure headers but CSP disabled for HTML inline scripts)
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow Tailwind + inline scripts
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "no-referrer" },
    hidePoweredBy: true,
  })
);

// ✅ Logger
app.use(morgan("dev"));

// ✅ Serve public files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// =========================================================
// 🔑 JWT AUTH MIDDLEWARE
// =========================================================
function authMiddleware(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Token tidak ditemukan." });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Token tidak valid atau kedaluwarsa." });
  }
}

// =========================================================
// 📦 ROUTE IMPORTS
// =========================================================
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const profileRoutes = require("./routes/profile");

const tourRoutes = require("./routes/tours");
const reportTourRoutes = require("./routes/reportTour");
const reportSalesRoutes = require("./routes/reportSales");
const reportDocumentRoutes = require("./routes/reportDocument");

const dashboardRoutes = require("./routes/dashboard");
const executiveReportRoutes = require("./routes/executiveReport");

// =========================================================
// 🚏 API ROUTES
// =========================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/profile", authMiddleware, profileRoutes);

app.use("/api/tours", authMiddleware, tourRoutes);
app.use("/api/report/tours", authMiddleware, reportTourRoutes);
app.use("/api/report/sales", authMiddleware, reportSalesRoutes);
app.use("/api/report/documents", authMiddleware, reportDocumentRoutes);

app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/executive", authMiddleware, executiveReportRoutes);

// =========================================================
// 🌐 STATIC FRONTEND ROUTES
// =========================================================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));
app.get("/profile", (req, res) => res.sendFile(path.join(__dirname, "public", "profile.html")));
app.get("/users", (req, res) => res.sendFile(path.join(__dirname, "public", "user-management.html")));

// =========================================================
// 💾 DAILY BACKUP (03:00 AM)
// =========================================================
const backupDir = process.env.BACKUP_DIR || path.join(__dirname, "backups");
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

nodeCron.schedule(process.env.CRON_BACKUP_SCHEDULE || "0 3 * * *", () => {
  const date = new Date().toISOString().split("T")[0];
  const backupPath = path.join(backupDir, `backup_${date}.sqlite`);

  try {
    // Copy database
    fs.copyFileSync(dbPath, backupPath);
    console.log(`[${new Date().toISOString()}] 💾 Backup created: ${backupPath}`);

    // Auto purge old backups (>7 days)
    const RETENTION_DAYS = 7;
    const now = Date.now();
    const files = fs.readdirSync(backupDir);
    files.forEach(file => {
      if (file.startsWith("backup_") && file.endsWith(".sqlite")) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const ageDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);
        if (ageDays > RETENTION_DAYS) {
          fs.unlinkSync(filePath);
          console.log(`[${new Date().toISOString()}] 🧹 Deleted old backup: ${file}`);
        }
      }
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Backup or purge failed: ${err.message}`);
  }
});

// =========================================================
// 🧪 HEALTH CHECK
// =========================================================
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    environment: process.env.NODE_ENV,
    database: fs.existsSync(dbPath),
    time: new Date().toISOString(),
  });
});

// =========================================================
// ❌ 404 HANDLER
// =========================================================
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan." });
});

// =========================================================
// 🔥 GLOBAL ERROR HANDLER
// =========================================================
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);
  res.status(500).json({ error: "Terjadi kesalahan pada server." });
});

// =========================================================
// 🚀 START SERVER
// =========================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
