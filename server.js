// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const { logger, httpLogger } = require("./config/logger");
const db = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware Global ===
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(bodyParser.json());
app.use(httpLogger);
app.use(express.static(path.join(__dirname, "public")));

// === Routes ===
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/regions", require("./routes/regions"));
app.use("/api/tours", require("./routes/tours"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/users", require("./routes/users"));

// === Health Check ===
app.get("/health", (req, res) => res.json({ status: "ok" }));

// === SPA Fallback ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// === Start Server ===
app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
});

process.on("uncaughtException", (err) => logger.error("💥 Uncaught Exception: " + err.message));
process.on("unhandledRejection", (err) => logger.error("💥 Unhandled Rejection: " + err));
