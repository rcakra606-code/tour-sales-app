/**
 * ===============================
 * 🚀 MAIN SERVER CONFIGURATION
 * ===============================
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { logger, httpLogger } = require("./config/logger");
const db = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());
app.use(httpLogger);
app.use(express.urlencoded({ extended: true }));

// Serve frontend (public folder)
app.use(express.static(path.join(__dirname, "public")));

/* ---------- ROUTES ---------- */
try {
  const authRoutes = require("./routes/auth");
  const tourRoutes = require("./routes/tours");
  const salesRoutes = require("./routes/sales");
  const dashboardRoutes = require("./routes/dashboard");
  const regionRoutes = require("./routes/regions");
  const userRoutes = require("./routes/users");

  app.use("/api/auth", authRoutes);
  app.use("/api/tours", tourRoutes);
  app.use("/api/sales", salesRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/regions", regionRoutes);
  app.use("/api/users", userRoutes);

  logger.info("✅ All routes initialized successfully");
} catch (err) {
  logger.error(`❌ Failed to load routes: ${err.message}`);
}

/* ---------- HEALTH CHECK ---------- */
app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime(), db: !!db });
});

/* ---------- ERROR HANDLER ---------- */
app.use((err, req, res, next) => {
  logger.error(`❌ ${err.message}`);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

/* ---------- SERVER START ---------- */
app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
});
