// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { logger, httpLogger } = require("./config/logger");

// === Init Database ===
require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(httpLogger);

// ✅ Helmet CSP fix (tanpa unsafe-eval)
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
          "https://cdn.jsdelivr.net/npm/chart.js",
        ],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": ["'self'", "https://cdn.jsdelivr.net"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// === Static Frontend ===
app.use(express.static(path.join(__dirname, "public")));

// === API Routes ===
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/tours", require("./routes/tours"));
app.use("/api/regions", require("./routes/regions"));
app.use("/api/users", require("./routes/users"));

// === SPA Fallback ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === Error Handling ===
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// === Start Server ===
app.listen(PORT, () => logger.info(`✅ Server running on port ${PORT}`));
