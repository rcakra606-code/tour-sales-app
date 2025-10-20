// ==========================================================
// 🚀 Travel Dashboard Enterprise v5.1
// Main Server (Express + Neon PostgreSQL)
// ==========================================================

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import pkg from "pg";
import fs from "fs";

// Load env
dotenv.config();

// PostgreSQL setup
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Express app
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================================
// Middleware
// ==========================================================
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Helmet (Security Headers)
app.use(
  helmet({
    contentSecurityPolicy: false, // disable CSP strict mode (for inline scripts)
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Logger
app.use(morgan("dev"));

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// ==========================================================
// Database Migration (auto-run once per boot)
// ==========================================================
import { execSync } from "child_process";

try {
  console.log("⏳ Checking and migrating database...");
  execSync("node ./scripts/migrateDatabase.js", { stdio: "inherit" });
  console.log("✅ Database migration completed!");
} catch (err) {
  console.error("⚠️ Database migration skipped or failed:", err.message);
}

// ==========================================================
// Routes Import
// ==========================================================
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import toursRoutes from "./routes/tours.js";
import salesRoutes from "./routes/sales.js";
import documentsRoutes from "./routes/documents.js";
import usersRoutes from "./routes/users.js";
import regionsRoutes from "./routes/regions.js";
import logsRoutes from "./routes/logs.js";
import executiveRoutes from "./routes/executiveReport.js";

// ==========================================================
// Routes Use
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

// ==========================================================
// Health Check
// ==========================================================
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Landing Page -> login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Catch-All untuk semua route frontend lain
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ==========================================================
// Error Handling Middleware
// ==========================================================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ==========================================================
// Server Start
// ==========================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [ENV: ${process.env.NODE_ENV}]`);
});
