// server.js — Travel Dashboard Enterprise v2.0
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const nodeCron = require("node-cron");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// === Express App ===
const app = express();
const PORT = process.env.PORT || 5000;

// === Database Setup ===
const dbPath = path.join(__dirname, "data", "database.sqlite");
if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
console.log(`[${new Date().toISOString()}] INFO: ✅ Database connected at ${dbPath}`);

// === Middleware ===
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com", "https://unpkg.com"],
        "style-src": ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
        "img-src": ["'self'", "data:"],
      },
    },
  })
);
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// === Utility: Logger (simple console + file append) ===
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logStream = fs.createWriteStream(path.join(logDir, "access.log"), { flags: "a" });

// === JWT Middleware ===
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

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

// === Route Modules ===
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const profileRoutes = require("./routes/profile");

const tourRoutes = require("./routes/tours");
const reportTourRoutes = require("./routes/reportTour");

const reportSalesRoutes = require("./routes/reportSales");
const reportDocumentRoutes = require("./routes/reportDocument");

const dashboardRoutes = require("./routes/dashboard");
const executiveReportRoutes = require("./routes/executiveReport");

// === Use Routes ===
app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/profile", authMiddleware, profileRoutes);

app.use("/api/tours", authMiddleware, tourRoutes);
app.use("/api/report/tours", authMiddleware, reportTourRoutes);
app.use("/api/report/sales", authMiddleware, reportSalesRoutes);
app.use("/api/report/documents", authMiddleware, reportDocumentRoutes);

app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/executive", authMiddleware, executiveReportRoutes);

// === Health Check ===
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server running", time: new Date().toISOString() });
});

// === Static Routes (Frontend Pages) ===
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "executive-dashboard.html")));
app.get("/profile", (req, res) => res.sendFile(path.join(__dirname, "public", "profile.html")));

// === Backup Cron Job (daily) ===
const backupDir = path.join(__dirname, "backups");
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

nodeCron.schedule("0 3 * * *", () => {
  const date = new Date().toISOString().split("T")[0];
  const backupPath = path.join(backupDir, `backup_${date}.sqlite`);
  fs.copyFileSync(dbPath, backupPath);
  console.log(`[${new Date().toISOString()}] ✅ Database backed up to ${backupPath}`);
});

// === 404 Handler ===
app.use((req, res) => res.status(404).json({ error: "Endpoint tidak ditemukan." }));

// === Error Handler ===
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ error: "Terjadi kesalahan server." });
});

// === Start Server ===
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
