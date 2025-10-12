// =====================================
// ✅ Core Setup
// =====================================
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const http = require("http");
const fs = require("fs");
const crypto = require("crypto");
require("dotenv").config();

// =====================================
// ✅ Auto-generate JWT Secret if missing
// =====================================
if (!process.env.JWT_SECRET) {
  const secret = crypto.randomBytes(32).toString("hex");
  process.env.JWT_SECRET = secret;

  try {
    const envPath = path.join(__dirname, ".env");
    if (fs.existsSync(envPath)) {
      fs.appendFileSync(envPath, `\nJWT_SECRET=${secret}`);
      console.log("🔐 JWT_SECRET added to existing .env file");
    } else {
      fs.writeFileSync(envPath, `JWT_SECRET=${secret}`);
      console.log("🔐 .env file created with JWT_SECRET");
    }
  } catch (err) {
    console.warn("⚠️ Could not save JWT_SECRET to .env file:", err.message);
  }

  console.log(`✅ JWT secret generated automatically (${secret.slice(0, 8)}...)`);
} else {
  console.log("🔑 JWT_SECRET loaded from environment file.");
}

// =====================================
// ✅ Optional Logging
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
// ✅ Helmet Security
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
// ✅ Routes Directory Auto-detect
// =====================================
let routesDir = path.join(__dirname, "routes");
if (!fs.existsSync(routesDir)) {
  const alt = path.join(__dirname, "src", "routes");
  if (fs.existsSync(alt)) routesDir = alt;
}
console.log("📂 Using routes directory:", routesDir);

// =====================================
// ✅ Static Frontend
// =====================================
const publicDir = fs.existsSync(path.join(__dirname, "public"))
  ? path.join(__dirname, "public")
  : path.join(__dirname, "src", "public");

app.use(
  "/js",
  express.static(path.join(publicDir, "js"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);
app.use(express.static(publicDir));

// =====================================
// ✅ Database Auto-load & Admin Check
// =====================================
try {
  const dbPath = path.join(__dirname, "config", "database.js");
  if (fs.existsSync(dbPath)) {
    const db = require(dbPath);
    console.log(`📦 Database module loaded successfully from: ${dbPath}`);

    // Auto check admin account
    const bcrypt = require("bcryptjs");
    const admin = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");

    if (!admin) {
      const hash = bcrypt.hashSync("admin123", 10);
      db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(
        "admin",
        hash,
        "admin"
      );
      console.log("✅ Default admin account recreated: admin / admin123");
    } else {
      console.log("ℹ️ Admin account exists, skipping auto-create.");
    }
  } else {
    console.warn(`⚠️ Database module missing: ${dbPath}`);
  }
} catch (e) {
  console.error("❌ Database load or admin check failed:", e.message);
}

// =====================================
// ✅ API Route Loader
// =====================================
const loadedRoutes = [];
try {
  const useRoute = (endpoint, file) => {
    const routePath = path.join(routesDir, `${file}.js`);
    if (fs.existsSync(routePath)) {
      app.use(endpoint, require(routePath));
      loadedRoutes.push(`${endpoint} → ${file}.js`);
      console.log(`✅ Route loaded: ${endpoint} → ${routePath}`);
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

console.log("🧭 Active routes:", loadedRoutes.join(", ") || "None");

// =====================================
// ✅ Health Check
// =====================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    node: process.version,
    environment: process.env.NODE_ENV || "development",
    jwtLoaded: !!process.env.JWT_SECRET,
    routesLoaded: loadedRoutes.length,
    time: new Date().toISOString(),
  });
});

// =====================================
// ✅ 404 for API
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
  console.log(`🌍 Visit: http://localhost:${PORT}`);
});

// =====================================
// ✅ Graceful Shutdown
// =====================================
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully");
  server.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  logger.info("SIGINT received — shutting down gracefully");
  server.close(() => process.exit(0));
});
