// ==========================================================
// 🚀 Travel Dashboard Enterprise v5.5
// Full Server Setup — Render + NeonDB + Corporate UI
// ==========================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

// ==========================================================
// 🧩 CONFIGURATION
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
// 🛡️ MIDDLEWARES
// ==========================================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ==========================================================
// 📁 STATIC FRONTEND
// ==========================================================
app.use(express.static(path.join(__dirname, "public")));

// default redirect to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// redirect fallback for client-side routes (e.g. login.html)
app.get("/:page.html", (req, res) => {
  const filePath = path.join(__dirname, "public", `${req.params.page}.html`);
  res.sendFile(filePath);
});

// ==========================================================
// 🔗 ROUTES IMPORT
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
// 🧭 API ROUTES
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
// 🩺 HEALTH CHECK ENDPOINT
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
// 🧠 AUTO-INIT DATABASE (failsafe)
// ==========================================================
async function ensureAdminUser() {
  try {
    const result = await pool.query("SELECT * FROM users WHERE username='admin'");
    if (result.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (username, password_hash, staff_name, role) VALUES ($1, $2, $3, $4)",
        [
          "admin",
          "$2a$10$ZJbReuZx.bVG7pr8lLu3wOg3bV20zPpxfVhQwvfth9OYhU5hMLPka",
          "Administrator",
          "admin",
        ]
      );
      console.log("👑 Default admin account created (admin / admin123)");
    } else {
      console.log("✅ Default admin account found.");
    }
  } catch (err) {
    console.error("❌ Admin check failed:", err.message);
  }
}

async function ensureTablesExist() {
  const tables = [
    "users",
    "regions",
    "tours",
    "sales",
    "documents",
    "targets",
    "logs",
  ];
  for (const table of tables) {
    try {
      await pool.query(`SELECT 1 FROM ${table} LIMIT 1;`);
      console.log(`✅ Table OK: ${table}`);
    } catch {
      console.warn(`⚠️ Table missing: ${table} — creating...`);
      // Fallback minimal creation
      if (table === "users") {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            staff_name VARCHAR(100),
            role VARCHAR(20) DEFAULT 'staff',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log("🧱 Created table: users");
      }
      if (table === "logs") {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS logs (
            id SERIAL PRIMARY KEY,
            user_name VARCHAR(100),
            role VARCHAR(20),
            action VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log("🧱 Created table: logs");
      }
    }
  }
}

// ==========================================================
// 🚀 START SERVER
// ==========================================================
app.listen(PORT, async () => {
  console.log("=======================================================");
  console.log("🚀 Travel Dashboard Enterprise v5.5 Running");
  console.log("=======================================================");
  console.log(`🌐 Server Live on Port: ${PORT}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? "Connected" : "Missing URL"}`);
  console.log(`📂 Static UI Path: ${path.join(__dirname, "public")}`);
  console.log("-------------------------------------------------------");

  await ensureTablesExist();
  await ensureAdminUser();

  console.log("✅ Initialization complete.");
  console.log("=======================================================");
});