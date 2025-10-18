// =========================================================
// server.js — Travel Dashboard Enterprise v2.3 (AUTO INIT + SECURE)
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
// 🧱 DATABASE INITIALIZATION (AUTO CHECK & INIT)
// =========================================================
const dbPath = path.join(__dirname, "data", "database.sqlite");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// 🔹 Jika database belum ada, jalankan initDatabase.js otomatis
if (!fs.existsSync(dbPath)) {
  console.log("⚠️ Database not found. Initializing new database...");
  try {
    require("./scripts/initDatabase.js");
    console.log("✅ Database initialized successfully.");
  } catch (err) {
    console.error("❌ Failed to initialize database:", err.message);
    process.exit(1);
  }
}

const db = new Database(dbPath);
console.log(`[${new Date().toISOString()}] ✅ Database connected: ${dbPath}`);

// =========================================================
// ⚙️ MIDDLEWARE SETUP
// =========================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ CORS (untuk koneksi frontend)
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Helmet (CSP fix agar Tailwind/Chart.js tidak terblokir)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdn.jsdelivr.net",
          "https://cdn.tailwindcss.com",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net/npm/sweetalert2@11"
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com"
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
        "connect-src": [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
          process.env.FRONTEND_URL || "http://localhost:5000"
        ],
        "frame-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"]
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "no-referrer" },
    hidePoweredBy: true,
  })
);

// ✅ Logging request
app.use(morgan("dev"));

// ✅ Serve static files (frontend HTML)
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
// 💾 AUTO BACKUP (JAM 03:00)
// =========================================================
const backupDir = process.env.BACKUP_DIR || path.join(__dirname, "backups");
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

nodeCron.schedule(process.env.CRON_BACKUP_SCHEDULE || "0 3 * * *", () => {
  const date = new Date().toISOString().split("T")[0];
  const backupPath = path.join(backupDir, `backup_${date}.sqlite`);
  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`[${new Date().toISOString()}] 💾 Database backup created: ${backupPath}`);
  } catch (err) {
    console.error("❌ Backup failed:", err.message);
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
