/**
 * 🌐 MAIN SERVER
 * Express + SQLite + JWT + Logger
 */

require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const db = require("./config/database");
const { logger } = require("./config/logger");

// === Express app ===
const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Matikan CSP ketat agar tidak blok eval dari chart.js
}));
app.use(morgan("dev"));

// === Static public files ===
app.use(express.static(path.join(__dirname, "public")));

// === ROUTES ===
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const regionRoutes = require("./routes/region");

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/regions", regionRoutes);

// === HEALTH CHECK ===
app.get("/health", (_, res) => res.json({ status: "ok" }));

// === AUTO-CREATE DEFAULT ADMIN ===
try {
  const existing = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
  if (!existing) {
    const hashed = bcrypt.hashSync("admin123", 10);
    db.prepare(`
      INSERT INTO users (name, username, email, password, role, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("Administrator", "admin", "admin@example.com", hashed, "admin", "admin");
    logger.info("👤 Default admin user created: admin / admin123");
  } else {
    logger.info("✅ Admin account already exists");
  }
} catch (err) {
  logger.error("❌ Error checking/creating admin:", err.message);
}

// === FALLBACK FRONTEND ROUTE ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// === START SERVER ===
app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
});
