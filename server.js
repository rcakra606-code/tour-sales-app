// =====================================
// ✅ Core Setup
// =====================================
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

// =====================================
// ✅ Logging (tanpa crash jika modul opsional)
// =====================================
let morgan, winston;
try {
  morgan = require("morgan");
  winston = require("winston");
} catch (err) {
  console.warn("⚠️ Optional logging modules missing, using console only.");
}

const logger =
  winston?.createLogger({
    level: "info",
    transports: [new winston.transports.Console()],
  }) || console;

const httpLogger = morgan ? morgan("dev") : (req, res, next) => next();

// =====================================
// ✅ Jalankan auto init database (scripts/init-db.js)
// =====================================
try {
  const initDB = require("./scripts/init-db");
  if (typeof initDB === "function") {
    console.log("🧩 Running automatic database initialization...");
    initDB()
      .then(() => console.log("✅ Database initialized successfully"))
      .catch((err) => console.error("❌ DB init failed:", err.message));
  } else {
    console.log("ℹ️ Skipping DB init (no export function found)");
  }
} catch (err) {
  console.warn("⚠️ Could not auto-run init-db script:", err.message);
}

// =====================================
// ✅ App Initialization
// =====================================
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// ✅ Helmet Security (relaxed for CDN)
// =====================================
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://cdn.tailwindcss.com",
          "https://fonts.googleapis.com"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "*"]
      }
    }
  })
);

// =====================================
// ✅ Middleware
// =====================================
app.use(cors());
app.use(httpLogger);

// =====================================
// ✅ Static Frontend
// =====================================
app.use(
  "/js",
  express.static(path.join(__dirname, "public", "js"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    }
  })
);
app.use(express.static(path.join(__dirname, "public")));

// =====================================
// ✅ API Routes
// =====================================
try {
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/tours", require("./routes/tours"));
  app.use("/api/sales", require("./routes/sales"));
  app.use("/api/dashboard", require("./routes/dashboard"));
  app.use("/api/uploads", require("./routes/upload"));
} catch (err) {
  console.error("⚠️ Route load failed:", err.message);
}

// =====================================
// ✅ Health Check
// =====================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    node: process.version,
    environment: process.env.NODE_ENV || "development",
    time: new Date().toISOString()
  });
});

// =====================================
// ✅ 404 Handler for API
// =====================================
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// =====================================
// ✅ SPA Fallback
// =====================================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =====================================
// ✅ Start Server
// =====================================
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
});

// =====================================
// ✅ Graceful Shutdown
// =====================================
process.on("SIGTERM", () => {
  logger.info("SIGTERM received: shutting down gracefully");
  server.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  logger.info("SIGINT received: shutting down gracefully");
  server.close(() => process.exit(0));
});
