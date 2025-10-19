/**
 * ==========================================================
 * 🚀 server.js — Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Optimized for:
 * - Render hosting
 * - Neon PostgreSQL
 * - Full ESM support
 * ==========================================================
 */

import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import fs from "fs";

// ====== Load Environment ======
dotenv.config();

// ====== Initialize Express ======
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== PostgreSQL Connection (Neon) ======
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ====== Test Database Connection ======
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
  }
})();

// ====== Middleware ======
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ====== CSP & Security Headers ======
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https:", "http:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ====== Static Public Folder ======
app.use(express.static(path.join(__dirname, "public")));

// ====== API Routes ======
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import toursRoutes from "./routes/tours.js";
import salesRoutes from "./routes/sales.js";
import documentsRoutes from "./routes/documents.js";
import usersRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import logsRoutes from "./routes/logs.js";

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/logs", logsRoutes);

// ====== Health Check (Render) ======
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");
    res.status(200).json({
      status: "ok",
      db_time: result.rows[0].time,
      message: "Server and database are healthy 🚀",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// ====== Serve HTML (Fallback) ======
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ====== PORT CONFIG ======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`)
);