// server.js — Travel Dashboard (final clean version)
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

// ===== Middleware global =====
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// ===== Logger setup =====
if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: "./logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "./logs/combined.log" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});
app.use(morgan("dev"));

// ===== Serve frontend =====
app.use(express.static(path.join(__dirname, "public")));

// ===== Middleware JWT Auth =====
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

// ===== Routes =====
try {
  const authRoutes = require("./routes/auth");
  const userRoutes = require("./routes/users");
  const tourRoutes = require("./routes/tours");
  const salesRoutes = require("./routes/sales");
  const docRoutes = require("./routes/documents");
  const dashboardRoutes = require("./routes/dashboard");

  app.use("/api/auth", authRoutes);
  app.use("/api/users", authMiddleware, userRoutes);
  app.use("/api/tours", authMiddleware, tourRoutes);
  app.use("/api/sales", authMiddleware, salesRoutes);
  app.use("/api/documents", authMiddleware, docRoutes);
  app.use("/api/dashboard", authMiddleware, dashboardRoutes);
} catch (err) {
  logger.error("❌ Error loading routes: " + err.message);
}

// ===== Default route =====
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// ===== Backup otomatis (harian) =====
nodeCron.schedule(BACKUP_SCHEDULE, async () => {
  try {
    if (!fs.existsSync(DB_PATH)) return;
    await fsExtra.ensureDir(BACKUP_DIR);
    const ts = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
    const backupPath = path.join(BACKUP_DIR, `backup-${ts}.sqlite`);
    await fsExtra.copy(DB_PATH, backupPath);
    logger.info(`📦 Database backup created: ${backupPath}`);
  } catch (err) {
    logger.error("Backup failed: " + err.message);
  }
});

// ===== Error handler =====
app.use((err, req, res, next) => {
  logger.error("Unhandled error: " + err.message);
  res.status(500).json({ error: "Terjadi kesalahan server." });
});

// ===== Start server =====
app.listen(PORT, () => {
  logger.info(`✅ Server started on port ${PORT}`);
  logger.info(`📂 Database: ${DB_PATH}`);
  logger.info(`🕒 Backup schedule: ${BACKUP_SCHEDULE}`);
});
