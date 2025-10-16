// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const { logger, httpLogger } = require("./config/logger");
const db = require("./config/database");

// === ROUTES ===
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const toursRoutes = require("./routes/tours");
const salesRoutes = require("./routes/sales");
const usersRoutes = require("./routes/users");
const regionsRoutes = require("./routes/regions");

// === EXPRESS APP ===
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(httpLogger);

// === ROUTING ===
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/regions", regionsRoutes);

// === FRONTEND (PUBLIC FOLDER) ===
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// === SERVER LISTEN ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`✅ Server running on port ${PORT}`));
