// ==========================================================
// 🚀 Travel Dashboard Enterprise v5.5.1 — Corporate Blue Edition
// Universal HTML Router + Sidebar & Theme Fix
// ==========================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

// ==========================================================
// ⚙️ CONFIGURATION
// ==========================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🧱 MIDDLEWARES
// ==========================================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// ==========================================================
// 📁 STATIC FRONTEND — UNIVERSAL HTML ROUTING
// ==========================================================
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// Default route ke index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Universal router untuk semua .html (tanpa error “Cannot GET”)
app.get("/:page", (req, res, next) => {
  const fileName = `${req.params.page}.html`;
  const filePath = path.join(publicPath, fileName);
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  next();
});

// ==========================================================
// 🔗 ROUTES IMPORT (API BACKEND)
// ==========================================================
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import toursRoutes from "./routes/tours.js";
import salesRoutes from "./routes/sales.js";
import documentsRoutes from "./routes/documents.js";
import regionsRoutes from "./routes/regions.js";
import targetsRoutes from "./routes/targets.js";
import usersRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";

// ==========================================================
// 🧭 API ROUTES REGISTER
// ==========================================================
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/regions", regionsRoutes);
app.use("/api/targets", targetsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/profile", profileRoutes);

// ==========================================================
// 🩺 HEALTH CHECK
// ==========================================================
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ==========================================================
// 👑 AUTO CREATE ADMIN (Failsafe)
// ==========================================================
async function ensureAdmin() {
  try {
    const check = await pool.query("SELECT * FROM users WHERE username='admin'");
    if (check.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (username,password_hash,staff_name,role) VALUES ($1,$2,$3,$4)",
        [
          "admin",
          "$2a$10$ZJbReuZx.bVG7pr8lLu3wOg3bV20zPpxfVhQwvfth9OYhU5hMLPka",
          "Administrator",
          "admin",
        ]
      );
      console.log("👑 Default admin created (admin / admin123)");
    } else {
      console.log("✅ Default admin exists.");
    }
  } catch (err) {
    console.error("❌ Failed to ensure admin:", err.message);
  }
}

// ==========================================================
// 🚀 START SERVER
// ==========================================================
app.listen(PORT, async () => {
  console.log("=======================================================");
  console.log("🚀 Travel Dashboard Enterprise v5.5.1 — Started");
  console.log("=======================================================");
  console.log(`🌐 Running on PORT: ${PORT}`);
  console.log(`📁 Serving static from: ${publicPath}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? "Connected" : "Missing"}`);
  console.log("-------------------------------------------------------");

  await ensureAdmin();

  console.log("✅ Admin check complete.");
  console.log("=======================================================");
});