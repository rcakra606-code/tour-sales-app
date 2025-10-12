// =====================================
// ✅ Core Setup
// =====================================
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const http = require("http");
const fs = require("fs");
require("dotenv").config();

// =====================================
// ✅ Optional Logging (safe fallback)
// =====================================
let morgan, winston;
try {
  morgan = require("morgan");
  winston = require("winston");
} catch {
  console.warn("⚠️ Optional logging modules missing — using console only");
}

const logger =
  winston?.createLogger({
    level: "info",
    transports: [new winston.transports.Console()],
  }) || console;

const httpLogger = morgan ? morgan("dev") : (req, res, next) => next();

// =====================================
// ✅ App Initialization
// =====================================
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(httpLogger);

// =====================================
// ✅ Helmet Security (Relaxed for CDN)
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
          "https://cdnjs.cloudflare.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "*"],
      },
    },
  })
);

// =====================================
// ✅ Detect Routes Directory
// =====================================
let routesDir = path.join(__dirname, "routes");
if (!fs.existsSync(routesDir)) {
  const alt = path.join(__dirname, "src", "routes");
  if (fs.existsSync(alt)) routesDir = alt;
}
console.log("📂 Using routes directory:", routesDir);

// =====================================
// ✅ Public Folder (Frontend)
// =====================================
const publicDir = fs.existsSync(path.join(__dirname, "public"))
  ? path.join(__dirname, "public")
  : path.join(__dirname, "src", "public");

app.use(
  "/js",
  express.static(path.join(publicDir, "js"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) res.setHeader("Content-Type", "application/javascript");
    },
  })
);
app.use(express.static(publicDir));

// =====================================
// ✅ Uploads Folder (static serve)
// =====================================
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// =====================================
// ✅ Dynamic Route Loader
// =====================================
const loadedRoutes = [];
try {
  const useRoute = (endpoint, file) => {
    const routePath = path.join(routesDir, `${file}.js`);
    if (fs.existsSync(routePath)) {
      app.use(endpoint, require(routePath));
      loadedRoutes.push(`${endpoint} → ${file}.js`);
    } else {
      console.warn(`⚠️ Route file not found: ${routePath}`);
    }
  };

  useRoute("/api/auth", "auth");
  useRoute("/api/tours", "tours");
  useRoute("/api/sales", "sales");
  useRoute("/api/dashboard", "dashboard");
  useRoute("/api/uploads", "upload");
} catch (err) {
  console.error("❌ Failed to register routes:", err);
}

// =====================================
// ✅ Health Check
// =====================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    node: process.version,
    environment: process.env.NODE_ENV || "development",
    routes: loadedRoutes,
    time: new Date().toISOString(),
  });
});

// =====================================
// ✅ 404 Handler for APIs
// =====================================
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// =====================================
// ✅ SPA Fallback
// =====================================
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// =====================================
// ✅ Start Server
// =====================================
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  logger.info(`🧭 Active routes (${loadedRoutes.length}):`);
  loadedRoutes.forEach((r) => console.log("   •", r));
  logger.info("🌍 Visit: http://localhost:" + PORT);
});

// =====================================
// ✅ Graceful Shutdown
// =====================================
process.on("SIGTERM", () => {
  logger.info("🛑 SIGTERM received — shutting down gracefully");
  server.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  logger.info("🛑 SIGINT received — shutting down gracefully");
  server.close(() => process.exit(0));
});
