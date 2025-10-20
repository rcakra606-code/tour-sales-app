// ==========================================================
// 🚀 Travel Dashboard Enterprise v5.2
// Server Entry Point (Render + Neon PostgreSQL)
// ==========================================================

import express from "express";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fs from "fs";

// ROUTES
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import toursRoutes from "./routes/tours.js";
import salesRoutes from "./routes/sales.js";
import documentsRoutes from "./routes/documents.js";
import usersRoutes from "./routes/users.js";
import regionsRoutes from "./routes/regions.js";
import logsRoutes from "./routes/logs.js";
import executiveRoutes from "./routes/executiveReport.js";
import profileRoutes from "./routes/profile.js";

// CONFIG
import pkg from "pg";
const { Pool } = pkg;

// ==========================================================
// 📦 INIT EXPRESS APP
// ==========================================================
const app = express();
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================================
// 🧩 DATABASE CONNECTION (NEON POSTGRESQL)
// ==========================================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🧱 AUTO MIGRATION (SAFE STRUCTURE)
// ==========================================================
async function runMigrations() {
  console.log("⏳ Checking database structure...");
  const migrationFile = path.join(__dirname, "scripts", "migrateDatabase.js");

  if (fs.existsSync(migrationFile)) {
    const { default: migrate } = await import("./scripts/migrateDatabase.js");
    await migrate();
  } else {
    console.warn("⚠️ Migration file not found: scripts/migrateDatabase.js");
  }
}

// ==========================================================
// 🧰 MIDDLEWARES
// ==========================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// CSP & Secure headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // disable strict CSP to allow chart.js & inline scripts
    crossOriginEmbedderPolicy: false,
  })
);

// Logging
app.use(morgan("dev"));

// ==========================================================
// 🗂️ STATIC FILES (Frontend Integration)
// ==========================================================
app.use(express.static(path.join(__dirname, "public")));

// ==========================================================
// 🔐 ROUTE MAPPING
// ==========================================================
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/regions", regionsRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/executive", executiveRoutes);
app.use("/api/profile", profileRoutes);

// ==========================================================
// ❤️ HEALTH CHECK ENDPOINT
// ==========================================================
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch {
    res.status(500).json({ status: "error", message: "Database unreachable" });
  }
});

// ==========================================================
// 🌐 ROUTE FALLBACKS (FRONTEND PAGES)
// ==========================================================

// Root -> Login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Other pages fallback (dashboard by default)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ==========================================================
// ⚙️ ERROR HANDLING
// ==========================================================
app.use((err, req, res, next) => {
  console.error("❌ Global error handler:", err.message);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// ==========================================================
// 🚀 START SERVER
// ==========================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await runMigrations().catch((err) =>
    console.error("❌ Migration error:", err.message)
  );
});