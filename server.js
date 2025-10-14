// =====================================
// Core Setup
// =====================================
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const fs = require("fs");
require("dotenv").config();

const db = require("./config/database"); // Better SQLite3

// =====================================
// Optional Logging
// =====================================
let morgan, winston;
try {
  morgan = require("morgan");
  winston = require("winston");
} catch {
  console.warn("Optional logging missing — using console only");
}

const logger =
  winston?.createLogger({
    level: "info",
    transports: [new winston.transports.Console()],
  }) || console;

const httpLogger = morgan ? morgan("dev") : (req, res, next) => next();

// =====================================
// App Initialization
// =====================================
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(httpLogger);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "*"],
      },
    },
  })
);

// =====================================
// Public / Uploads
// =====================================
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// =====================================
// Routes
// =====================================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tours", require("./routes/tours"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/dashboard", require("./routes/dashboard"));

// Health Check
app.get("/api/health", (req, res) => res.json({ status: "OK", time: new Date().toISOString() }));

// SPA Fallback
app.get("*", (req, res) => res.sendFile(path.join(publicDir, "index.html")));

// =====================================
// Server Start
// =====================================
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

// Graceful Shutdown
process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
