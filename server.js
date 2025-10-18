/**
 * server.js
 * FINAL BUILD (v2025.10)
 * ----------------------------------------------
 * Backend utama aplikasi Reporting Sales & Tour.
 * Menggunakan Express, JWT Auth, dan SQLite (better-sqlite3).
 */

const express = require("express");
const path = require("path");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getDB, initDB } = require("./db"); // koneksi SQLite helper

// ROUTES
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const toursRoutes = require("./routes/tours");
const salesRoutes = require("./routes/sales");
const docRoutes = require("./routes/documents");
const usersRoutes = require("./routes/users");
const regionRoutes = require("./routes/regions");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

/* =====================================================
   SECURITY MIDDLEWARE
   ===================================================== */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(bodyParser.json());

/* =====================================================
   STATIC FRONTEND
   ===================================================== */
app.use(express.static(path.join(__dirname, "public")));

/* =====================================================
   DATABASE INIT
   ===================================================== */
initDB(); // pastikan database & tabel sudah siap

/* =====================================================
   ROUTE REGISTRATIONS
   ===================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/documents", docRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/regions", regionRoutes);

/* =====================================================
   DEFAULT FRONTEND ROUTES
   ===================================================== */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

/* =====================================================
   AUTH MIDDLEWARE (for manual use in routes)
   ===================================================== */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token tidak tersedia" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token tidak valid" });
    req.user = user;
    next();
  });
}

/* =====================================================
   GLOBAL ERROR HANDLER
   ===================================================== */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ error: "Terjadi kesalahan internal server" });
});

/* =====================================================
   START SERVER
   ===================================================== */
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
