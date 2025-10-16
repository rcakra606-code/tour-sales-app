require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// === Import logger dan database ===
const { logger, httpLogger } = require("./config/logger");
const db = require("./config/database");

// === Import routes ===
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const toursRoutes = require("./routes/tours");
const salesRoutes = require("./routes/sales");
const usersRoutes = require("./routes/users");
const regionsRoutes = require("./routes/regions");

// === Inisialisasi app ===
const app = express();

// === Middleware global ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(httpLogger); // HTTP log via winston
app.use(morgan("dev")); // tambahan untuk console dev log

// === Helmet (dengan CSP longgar untuk CDN Tailwind & Chart.js) ===
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
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

// === API Routes ===
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/regions", regionsRoutes);

// === Serve frontend static ===
app.use(express.static(path.join(__dirname, "public")));

// === SPA fallback ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// === Jalankan server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (logger && typeof logger.info === "function") {
    logger.info(`✅ Server running on port ${PORT}`);
  } else {
    console.log(`✅ Server running on port ${PORT}`);
  }
});
