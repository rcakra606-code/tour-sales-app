// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// === Inisialisasi database ===
require("./config/database");

const app = express();

// === Middleware Umum ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// === Helmet dengan CSP yang diizinkan untuk Tailwind & Chart.js ===
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
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

// === Debug Info ===
console.log("✅ Initializing routes...");

// === Import Routes ===
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const salesRoutes = require("./routes/sales");
const toursRoutes = require("./routes/tours");
const documentsRoutes = require("./routes/documents");
const usersRoutes = require("./routes/users");

// === Register API Routes ===
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/users", usersRoutes);

console.log("✅ All API routes mounted successfully");

// === Serve file statis frontend ===
app.use(express.static(path.join(__dirname, "public")));

// === Health Check (optional, untuk Render uptime check) ===
app.get("/health", (req, res) => res.json({ status: "ok" }));

// === SPA Fallback (agar /dashboard, /sales, dst tetap bisa diakses langsung) ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === Jalankan Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
