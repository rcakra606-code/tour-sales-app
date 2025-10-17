/**
 * 🌍 MAIN SERVER
 * Express + Helmet + CORS + Better SQLite + Logger + Secure CSP
 */
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { logger, httpLogger } = require("./config/logger");

// === Init Database ===
require("./config/database");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const regionRoutes = require("./routes/regions");

const app = express();

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(httpLogger);

// === Helmet + CSP (allow Tailwind + Chart.js) ===
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// === Static Frontend ===
app.use(express.static(path.join(__dirname, "public")));

// === Routes ===
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/regions", regionRoutes);

// === SPA fallback ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`✅ Server running on port ${PORT}`));
