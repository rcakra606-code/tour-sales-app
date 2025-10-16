require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { logger, httpLogger } = require("./config/logger");

// === Initialize DB ===
require("./config/database");

const app = express();

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(httpLogger);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
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

// === Routes ===
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/tours", require("./routes/tours"));
app.use("/api/users", require("./routes/users"));
app.use("/api/regions", require("./routes/regions"));

// === Static Frontend ===
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
});
