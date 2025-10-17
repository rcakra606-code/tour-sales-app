// server.js — Travel Dashboard Backend (Final + CSP Safe)
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

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const BACKUP_SCHEDULE = process.env.BACKUP_SCHEDULE || "0 23 * * *";
const DB_PATH = process.env.DB_PATH || "./data/database.sqlite";
const BACKUP_DIR = process.env.DB_BACKUP_DIR || "./backups";
const NODE_ENV = process.env.NODE_ENV || "production";

// ===========================
// 🧾 LOGGER CONFIGURATION
// ===========================
if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: "./logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "./logs/combined.log" }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// ===========================
// 🧠 GLOBAL MIDDLEWARE
// ===========================
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// ✅ Custom Helmet dengan whitelist CDN (fix CSP error)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "https://cdn.tailwindcss.com",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net",
          "'unsafe-inline'"
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net"
        ],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
        "connect-src": ["'self'", "https://cdn.jsdelivr.net"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Serve frontend (React / HTML)
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
// 🚏 ROUTES LOADING
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
  logger.error("❌ Route load error: " + err.message);
}

// ===========================
// 🌐 DEFAULT ROOT
// ===========================
app.get("/", (req, res) => res.redirect("/login.html"));

// ===========================
// 💾 DAILY BACKUP SCHEDULER
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
    logger.error("Backup error: " + err.message);
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
// 🚀 SERVER START
// ===========================
app.listen(PORT, () => {
  logger.info(`🚀 Server started at http://localhost:${PORT}`);
  logger.info(`🗂 Database: ${DB_PATH}`);
  logger.info(`🕒 Backup Schedule: ${BACKUP_SCHEDULE}`);
  logger.info(`🌐 Environment: ${NODE_ENV}`);
});
