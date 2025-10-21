// ==========================================================
// 🚀 Travel Dashboard Enterprise v5.3.4
// Server Entry Point — Render + Neon + Backup + UI Routing Fix
// ==========================================================

import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";
import pkg from "pg";
const { Pool } = pkg;

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import toursRoutes from "./routes/tours.js";
import salesRoutes from "./routes/sales.js";
import documentsRoutes from "./routes/documents.js";
import usersRoutes from "./routes/users.js";
import regionsRoutes from "./routes/regions.js";
import executiveRoutes from "./routes/executiveReport.js";
import profileRoutes from "./routes/profile.js";
import logsRoutes from "./routes/logs.js";

import { errorHandler } from "./middleware/errorHandler.js";

// ==========================================================
// 🌍 Setup Environment
// ==========================================================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================================
// ⚙️ Middleware
// ==========================================================
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// ==========================================================
// 🗂️ Static File Serving
// ==========================================================
app.use(express.static(path.join(__dirname, "public")));

// ==========================================================
// 🧠 PostgreSQL Connection Check
// ==========================================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL Connected:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Failed to connect PostgreSQL:", err.message);
  }
})();

// ==========================================================
// 🔒 API ROUTES
// ==========================================================
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/regions", regionsRoutes);
app.use("/api/executive", executiveRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/logs", logsRoutes);

// ==========================================================
// ❤️ Healthcheck (for Render)
// ==========================================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    time: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
  });
});

// ==========================================================
// 🧭 Frontend HTML Fallbacks (Fix Login/Logout Not Loading)
// ==========================================================
const staticPages = [
  "index.html",
  "login.html",
  "logout.html",
  "dashboard.html",
  "report_tour.html",
  "report_sales.html",
  "report_document.html",
  "region_management.html",
  "user-management.html",
  "executive-dashboard.html",
  "audit_log.html",
  "profile.html"
];

staticPages.forEach((page) => {
  app.get("/" + page, (req, res) => {
    res.sendFile(path.join(__dirname, "public", page));
  });
});

// ==========================================================
// 🧱 Favicon Fallback (Prevent 404 in Render Logs)
// ==========================================================
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ==========================================================
// 🧰 Global Error Handler
// ==========================================================
app.use(errorHandler);

// ==========================================================
// 💾 Automatic Backup Scheduler (Optional)
// ==========================================================
if (process.env.CRON_BACKUP_SCHEDULE) {
  import("node-cron").then(({ default: cron }) => {
    cron.schedule(process.env.CRON_BACKUP_SCHEDULE, async () => {
      try {
        console.log("⏰ Running automatic scheduled backup...");
        const { exec } = await import("child_process");
        exec("node scripts/backup-database.js", (err, stdout, stderr) => {
          if (err) console.error("❌ Scheduled backup error:", err);
          if (stdout) console.log(stdout);
          if (stderr) console.warn(stderr);
        });
      } catch (err) {
        console.error("❌ Backup cron error:", err.message);
      }
    });
  });
}

// ==========================================================
// 🌐 Default Root Route (Redirect to index.html)
// ==========================================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==========================================================
// 🚀 Start Server
// ==========================================================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} (${process.env.NODE_ENV})`);
  console.log(`🗂️ Static files served from /public`);
  if (process.env.BACKUP_DIR)
    console.log(`💾 Backup directory: ${process.env.BACKUP_DIR}`);
});