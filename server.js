// ==========================================================
// 🚀 Travel Dashboard Enterprise v5.4.9 — Server.js
// ==========================================================

import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================================
// ⚙️ MIDDLEWARE
// ==========================================================
app.use(cors());
app.use(express.json({ limit: "2mb", strict: true }));
app.use(compression());

// ✅ Fix CSP agar fetch JS dari frontend tidak ditolak
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; connect-src *;"
  );
  next();
});

// ==========================================================
// 🗃️ DATABASE CONNECTION (NeonDB)
// ==========================================================
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err));

// ==========================================================
// 🛡️ API ROUTES
// ==========================================================
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import toursRoutes from "./routes/tours.js";
import salesRoutes from "./routes/sales.js";
import regionRoutes from "./routes/regions.js";
import usersRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import reportTourRoutes from "./routes/reportTour.js";
import reportSalesRoutes from "./routes/reportSales.js";
import reportDocumentRoutes from "./routes/reportDocument.js";
import targetRoutes from "./routes/targets.js";
import executiveReportRoutes from "./routes/executiveReport.js";
import logRoutes from "./routes/logs.js";

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/report/tours", reportTourRoutes);
app.use("/api/report/sales", reportSalesRoutes);
app.use("/api/report/documents", reportDocumentRoutes);
app.use("/api/targets", targetRoutes);
app.use("/api/executive", executiveReportRoutes);
app.use("/api/logs", logRoutes);

// ==========================================================
// 💓 HEALTH CHECK
// ==========================================================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

// ==========================================================
// 🌐 FRONTEND STATIC HANDLER
// ==========================================================
app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"],
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".js")) res.setHeader("Content-Type", "application/javascript");
  },
}));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==========================================================
// 🚀 START SERVER
// ==========================================================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});