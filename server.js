/**
 * ==========================================================
 * server.js — Travel Dashboard Enterprise v3.4.2
 * ==========================================================
 * ✅ Express + PostgreSQL (Neon)
 * ✅ Auto run scripts/init-db.js at startup (Render Ready)
 * ✅ Secure (Helmet CSP, CORS)
 * ✅ Route modularization
 * ✅ Global error handling
 * ==========================================================
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const cron = require("node-cron");
const { execSync } = require("child_process");
require("dotenv").config();

const db = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================================
// 🧠 Security Middlewares
// =========================================================
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],
        "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        "img-src": ["'self'", "data:", "blob:"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })
);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// =========================================================
// 🧭 Import Routes
// =========================================================
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const dashboardRoutes = require("./routes/dashboard");
const toursRoutes = require("./routes/tours");
const salesRoutes = require("./routes/sales");
const documentsRoutes = require("./routes/documents");
const regionsRoutes = require("./routes/regions");
const logsRoutes = require("./routes/logs");

// =========================================================
// 🛠️ Use Routes
// =========================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/regions", regionsRoutes);
app.use("/api/logs", logsRoutes);

// =========================================================
// 🩺 Health Check Endpoint (Render ping)
// =========================================================
app.get("/api/health", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// =========================================================
// 🌐 Default Route (redirect root ke login.html)
// =========================================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// =========================================================
// 🧹 Global Error Handler
// =========================================================
app.use(errorHandler);

// =========================================================
// 🕒 CRON Job Example (backup / log cleanup)
// =========================================================
cron.schedule("0 3 * * *", () => {
  console.log("🕒 Scheduled task: Daily maintenance running...");
});

// =========================================================
// 🚀 Server Initialization (with DB auto init)
// =========================================================
(async () => {
  console.log("⏳ Memeriksa koneksi ke PostgreSQL (Neon)...");
  const ok = await db.verifyConnection(5, 3000);
  if (!ok) {
    console.error("❌ Database tidak dapat dihubungi. Server berhenti.");
    process.exit(1);
  }

  // Jalankan init-db.js secara otomatis sebelum server aktif
  try {
    console.log("⚙️ Menjalankan inisialisasi database (init-db.js)...");
    execSync("node scripts/init-db.js", { stdio: "inherit" });
    console.log("✅ Inisialisasi database selesai.\n");
  } catch (err) {
    console.warn("⚠️ Gagal menjalankan init-db.js:", err.message);
  }

  // Jalankan server
  app.listen(PORT, () => {
    console.log(`✅ Database terkoneksi`);
    console.log(`🚀 Server aktif di port ${PORT}`);
    console.log(`🌐 Mode: ${process.env.NODE_ENV || "development"}`);
  });
})();
