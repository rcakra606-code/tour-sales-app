// ==========================================================
// 🚀 Travel Dashboard Enterprise — Server v5.3.6
// ==========================================================

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

// ==========================================================
// 🔧 Basic Config
// ==========================================================
const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🧠 Middlewares
// ==========================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));
app.use(compression());

// ==========================================================
// 🗂️ Static Files
// ==========================================================
app.use(express.static(path.join(__dirname, "public")));

// Favicon fallback (menghindari 404)
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ==========================================================
// 🧩 Routes Import
// ==========================================================
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import salesRoutes from "./routes/sales.js";
import tourRoutes from "./routes/tours.js";
import documentRoutes from "./routes/documents.js";
import regionRoutes from "./routes/regions.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import executiveRoutes from "./routes/executiveReport.js";
import logsRoutes from "./routes/logs.js";

// ==========================================================
// 🧭 API Routes
// ==========================================================
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/executive", executiveRoutes);
app.use("/api/logs", logsRoutes);

// ==========================================================
// 🩺 Health Check Endpoint
// ==========================================================
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      status: "ok",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error("❌ Health check error:", err);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// ==========================================================
// 🧭 Frontend Fallback (Redirect ke login atau dashboard)
// ==========================================================
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// Handle unknown routes → redirect ke login
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "Endpoint tidak ditemukan" });
  }
  res.redirect("/login.html");
});

// ==========================================================
// 🧱 Database Initialization Check
// ==========================================================
async function verifyConnection(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ PostgreSQL Connected");
      return true;
    } catch (err) {
      console.error(`❌ Database connection failed (attempt ${i + 1}/${retries}):`, err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  console.error("❌ PostgreSQL connection could not be established after retries.");
  process.exit(1);
}

// ==========================================================
// 🚀 Start Server
// ==========================================================
await verifyConnection();

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});