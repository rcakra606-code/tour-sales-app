// server.js — Travel Dashboard Backend (Final 2025)
// 🚀 Auto init database, safe CSP, full ready for Render deploy.

require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const winston = require("winston");
const nodeCron = require("node-cron");
const fsExtra = require("fs-extra");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const BACKUP_SCHEDULE = process.env.BACKUP_SCHEDULE || "0 23 * * *";
const DB_PATH = process.env.DB_PATH || "./data/database.sqlite";
const BACKUP_DIR = process.env.DB_BACKUP_DIR || "./backups";
const NODE_ENV = process.env.NODE_ENV || "production";

// ===========================
// 🧾 LOGGER SETUP
// ===========================
if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: "./logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "./logs/combined.log" }),
    new winston.transports.Console()
  ]
});

// ===========================
// 🧠 AUTO DATABASE INITIALIZATION
// ===========================
function initDatabase() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const db = new Database(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      name TEXT,
      email TEXT,
      type TEXT DEFAULT 'basic',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registrationDate TEXT,
      leadPassenger TEXT,
      allPassengers TEXT,
      paxCount INTEGER,
      tourCode TEXT,
      region TEXT,
      departureDate TEXT,
      bookingCode TEXT,
      tourPrice INTEGER,
      discountRemarks TEXT,
      staff TEXT,
      salesAmount INTEGER,
      profitAmount INTEGER,
      departureStatus TEXT
    );
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transactionDate TEXT,
      invoiceNumber TEXT,
      salesAmount INTEGER,
      profitAmount INTEGER,
      staff TEXT
    );
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documentReceiveDate TEXT,
      guestNames TEXT,
      bookingCodeDMS TEXT,
      tourCode TEXT,
      documentRemarks TEXT,
      documentStatus TEXT
    );
  `);

  // Admin user check
  const admin = db.prepare("SELECT username FROM users WHERE username = ?").get("admin");
  if (!admin) {
    const hash = bcrypt.hashSync(process.env.INIT_ADMIN_PASSWORD || "admin123", 8);
    db.prepare("INSERT INTO users (username,password,name,email,type) VALUES (?,?,?,?,?)")
      .run("admin", hash, "Administrator", "admin@example.com", "super");
    logger.info("✅ Default admin created: username=admin / password=admin123");
  }

  // Seed sample data if empty
  const tourCount = db.prepare("SELECT COUNT(*) AS c FROM tours").get().c;
  if (tourCount === 0) {
    db.prepare(`
      INSERT INTO tours (registrationDate,leadPassenger,paxCount,tourCode,region,departureDate,tourPrice,staff,departureStatus)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run("2025-10-10", "Budi Santoso", 2, "EU-001", "Europe", "2025-12-01", 25000000, "Agent A", "CONFIRMED");
    logger.info("✅ Sample tour added");
  }

  const salesCount = db.prepare("SELECT COUNT(*) AS c FROM sales").get().c;
  if (salesCount === 0) {
    db.prepare(`
      INSERT INTO sales (transactionDate,invoiceNumber,salesAmount,profitAmount,staff)
      VALUES (?,?,?,?,?)
    `).run("2025-10-12", "INV-001", 15000000, 3000000, "Agent A");
    logger.info("✅ Sample sale added");
  }

  db.close();
}
initDatabase();

// ===========================
// 🧱 GLOBAL MIDDLEWARE
// ===========================
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Allow cross-origin requests (Render frontend + CDN)
app.use(
  cors({
    origin: ["https://tour-sales-app.onrender.com", "http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Helmet with CSP whitelist for CDN (Tailwind, Chart.js, Lucide)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com"
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net"
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// ===========================
// 🔐 JWT AUTH MIDDLEWARE
// ===========================
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Unauthorized" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ===========================
// 🚏 ROUTES
// ===========================
try {
  const authRoutes = require("./routes/auth");
  const usersRoutes = require("./routes/users");
  const toursRoutes = require("./routes/tours");
  const dashboardRoutes = require("./routes/dashboard");

  app.use("/api/auth", authRoutes);
  app.use("/api/users", authMiddleware, usersRoutes);
  app.use("/api/tours", authMiddleware, toursRoutes);
  app.use("/api/dashboard", authMiddleware, dashboardRoutes);

  logger.info("✅ Routes loaded successfully.");
} catch (err) {
  logger.error("❌ Failed to load routes: " + err.message);
}

// ===========================
// 🌍 DEFAULT ROUTE
// ===========================
app.get("/", (req, res) => res.redirect("/login.html"));

// ===========================
// 💾 BACKUP SCHEDULER
// ===========================
nodeCron.schedule(BACKUP_SCHEDULE, async () => {
  try {
    await fsExtra.ensureDir(BACKUP_DIR);
    if (fs.existsSync(DB_PATH)) {
      const ts = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
      const dest = path.join(BACKUP_DIR, `backup-${ts}.sqlite`);
      await fsExtra.copy(DB_PATH, dest);
      logger.info(`📦 Database backup saved: ${dest}`);
    }
  } catch (err) {
    logger.error("Backup failed: " + err.message);
  }
});

// ===========================
// ⚠️ GLOBAL ERROR HANDLER
// ===========================
app.use((err, req, res, next) => {
  logger.error("Unhandled error: " + err.message);
  res.status(500).json({ error: "Internal server error." });
});

// ===========================
// 🚀 START SERVER
// ===========================
app.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
  logger.info(`🗂 Database: ${DB_PATH}`);
  logger.info(`🕒 Backup Schedule: ${BACKUP_SCHEDULE}`);
});
