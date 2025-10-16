// ==============================
// ✅ SERVER.JS — Main Application
// ==============================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

// === Import custom logger ===
const logger = require("./config/logger");
const { httpLogger } = logger;

// === Inisialisasi database ===
require("./config/database");

const app = express();

// === Middleware Umum ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(httpLogger); // gunakan morgan yang terhubung ke winston

// === Helmet dengan CSP aman untuk Tailwind & Chart.js ===
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ==============================
// ✅ ROUTES SETUP
// ==============================
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const salesRoutes = require("./routes/sales");
const toursRoutes = require("./routes/tours");
const usersRoutes = require("./routes/users");

// === Gunakan routes ===
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/users", usersRoutes);

// ==============================
// ✅ FRONTEND (Static Files)
// ==============================
app.use(express.static(path.join(__dirname, "public")));

// === Fallback ke index.html untuk SPA routing ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==============================
// ✅ GLOBAL ERROR HANDLER
// ==============================
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ==============================
// ✅ START SERVER
// ==============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
});
