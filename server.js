/**
 * Travel Dashboard Server
 * Backend API untuk manajemen Auth, Tours, Sales, Dashboard, dan Upload
 * Menggunakan: Express + Better-SQLite3 + JWT Auth
 */

const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Load environment variables
dotenv.config();

// ==============================
// 1️⃣ Inisialisasi Express App
// ==============================
const app = express();
const PORT = process.env.PORT || 10000;

// ==============================
// 2️⃣ Konfigurasi Logger (Winston + Morgan)
// ==============================
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join(logDir, "combined.log") }),
  ],
});
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

// Middleware logger HTTP
app.use(morgan("dev"));

// ==============================
// 3️⃣ Middleware Utama
// ==============================
app.use(helmet());
app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE", allowedHeaders: "Content-Type,Authorization" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// 4️⃣ Static Files
// ==============================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==============================
// 5️⃣ Import Routes
// ==============================
const authRoutes = require("./routes/auth");
const tourRoutes = require("./routes/tours");
const salesRoutes = require("./routes/sales");
const dashboardRoutes = require("./routes/dashboard");
const uploadRoutes = require("./routes/upload");

// ==============================
// 6️⃣ Pasang Routes
// ==============================
app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadRoutes);

// ==============================
// 7️⃣ Middleware Error Handler
// ==============================
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  console.error("❌ ERROR:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ==============================
// 8️⃣ Route Not Found Handler
// ==============================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// ==============================
// 9️⃣ Jalankan Server
// ==============================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  console.log(`🌍 Visit: http://localhost:${PORT}`);
});

module.exports = app;
