// ==========================================================
// 🚀 server.js — Travel Dashboard Enterprise v5.4.5
// ==========================================================
// Sekarang otomatis menjalankan initDatabase.js sebelum server start
// ==========================================================

import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
import bcryptjs from "bcryptjs";
const bcrypt = bcryptjs;

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import dashboardRoutes from "./routes/dashboard.js";
import tourRoutes from "./routes/tours.js";
import salesRoutes from "./routes/sales.js";
import regionRoutes from "./routes/regions.js";
import reportTourRoutes from "./routes/reportTour.js";
import reportSalesRoutes from "./routes/reportSales.js";
import reportDocumentRoutes from "./routes/reportDocument.js";
import logsRoutes from "./routes/logs.js";
import executiveRoutes from "./routes/executiveReport.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(compression());
app.use(express.static(path.join(__dirname, "public")));

// ==========================================================
// 🗄️ AUTO INITIALIZE DATABASE
// ==========================================================
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDatabase() {
  console.log("🧩 Memeriksa & inisialisasi database otomatis...");

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        staff_name TEXT,
        password_hash TEXT,
        role TEXT CHECK (role IN ('admin','semiadmin','staff')),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const columns = [
      ["staff_name", "TEXT"],
      ["password_hash", "TEXT"],
      ["role", "TEXT DEFAULT 'staff'"],
      ["created_at", "TIMESTAMP DEFAULT NOW()"],
    ];

    for (const [col, type] of columns) {
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col} ${type};`);
    }

    await pool.query(`
      UPDATE users SET role = 'staff' WHERE role IS NULL;
      UPDATE users SET staff_name = username WHERE staff_name IS NULL;
    `);

    const { rows } = await pool.query(
      "SELECT id, username, password_hash FROM users WHERE username = 'admin';"
    );

    if (rows.length === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await pool.query(
        `
        INSERT INTO users (username, staff_name, password_hash, role)
        VALUES ('admin', 'Administrator', $1, 'admin');
        `,
        [hash]
      );
      console.log("✅ Akun admin default dibuat (admin / admin123)");
    } else {
      const admin = rows[0];
      if (!admin.password_hash || typeof admin.password_hash !== "string") {
        console.warn("⚠️ Kolom password_hash admin tidak valid — diperbaiki...");
        await pool.query("DELETE FROM users WHERE username='admin';");
        const hash = await bcrypt.hash("admin123", 10);
        await pool.query(
          `
          INSERT INTO users (username, staff_name, password_hash, role)
          VALUES ('admin', 'Administrator', $1, 'admin');
          `,
          [hash]
        );
      } else {
        console.log("✅ Admin valid — tidak perlu perbaikan");
      }
    }

    console.log("✅ Database siap digunakan");
  } catch (err) {
    console.error("❌ Error init DB:", err.message);
  }
}

// ==========================================================
// 🧭 ROUTES
// ==========================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/report/tour", reportTourRoutes);
app.use("/api/report/sales", reportSalesRoutes);
app.use("/api/report/document", reportDocumentRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/executive", executiveRoutes);

// ==========================================================
// 🧩 HEALTH CHECK
// ==========================================================
app.get("/api/health", async (req, res) => {
  try {
    const db = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      database: "connected",
      time: db.rows[0].now,
    });
  } catch {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// ==========================================================
// 📂 FALLBACK
// ==========================================================
app.get("/", (req, res) => res.redirect("/login.html"));
app.use((req, res) => res.redirect("/login.html"));

// ==========================================================
// 🚀 START SERVER (after DB ready)
// ==========================================================
const PORT = process.env.PORT || 5000;

(async () => {
  await initDatabase(); // ✅ Jalankan sebelum server start
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
  });
})();