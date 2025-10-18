/**
 * ==========================================================
 * server.js — Travel Dashboard Enterprise v3.3 FINAL
 * ==========================================================
 * ✅ Express Server with Helmet & CSP
 * ✅ Role-Based Auth (JWT)
 * ✅ Auto DB Initialization
 * ✅ API Modular Routes (Tours, Sales, Documents, etc)
 * ✅ Automatic Backup Retention (7 days)
 * ==========================================================
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cron = require("node-cron");

const { initDB } = require("./db");
const { logAction } = require("./middleware/log");

// Inisialisasi app
const app = express();
const PORT = process.env.PORT || 3000;
const BACKUP_DIR = path.join(__dirname, "backups");
const DB_PATH = path.join(__dirname, "data", "travel.db");

// Pastikan direktori backup tersedia
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      "img-src": ["'self'", "data:", "blob:"],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      "font-src": ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
    },
  },
}));
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Inisialisasi Database
initDB();

// ROUTES IMPORT
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const toursRoutes = require("./routes/tours");
const salesRoutes = require("./routes/sales");
const documentsRoutes = require("./routes/documents");
const usersRoutes = require("./routes/users");
const logsRoutes = require("./routes/logs");
const regionsRoutes = require("./routes/regions");

// REGISTER ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/regions", regionsRoutes);

// HEALTH CHECK (untuk Render & Docker)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date() });
});

// AUTO BACKUP DATABASE (Setiap hari jam 03:00)
cron.schedule("0 3 * * *", () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.db`);
    fs.copyFileSync(DB_PATH, backupFile);
    console.log(`💾 Backup DB sukses: ${backupFile}`);
    logAction({ username: "system", type: "system" }, "Backup DB Otomatis", backupFile);
    cleanupOldBackups();
  } catch (err) {
    console.error("❌ Gagal backup database:", err);
  }
});

// Hapus backup yang lebih dari 7 hari
function cleanupOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();
  files.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const age = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);
    if (age > 7) {
      fs.unlinkSync(filePath);
      console.log(`🧹 Menghapus backup lama: ${file}`);
    }
  });
}

// DEFAULT ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
  console.log("🧩 Travel Dashboard Enterprise v3.3 siap digunakan");
});
