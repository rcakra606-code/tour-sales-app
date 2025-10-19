/**
 * ==========================================================
 * 📁 server.js (ESM Fixed)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Server utama Express.js — sekarang full ESM
 * ==========================================================
 */

import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Pool } from "pg";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import salesRoutes from "./routes/sales.js";
import toursRoutes from "./routes/tours.js";
import documentsRoutes from "./routes/documents.js";
import usersRoutes from "./routes/users.js";
import regionsRoutes from "./routes/regions.js";
import logsRoutes from "./routes/logs.js";

dotenv.config();

// Konversi __dirname untuk ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware dasar
app.use(express.json());
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false, // CSP akan diatur manual nanti
  })
);
app.use(morgan("dev"));

// Public folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/report/sales", salesRoutes);
app.use("/api/report/tour", toursRoutes);
app.use("/api/report/document", documentsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/regions", regionsRoutes);
app.use("/api/logs", logsRoutes);

// Root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      status: "ok",
      time: result.rows[0].now,
    });
    await pool.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});