const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const http = require("http");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Helmet CSP relaxed
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

// ================= Serve Static =================
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// Upload folder
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// ================= Routes =================
const routes = [
  ["auth", "/api/auth"],
  ["tours", "/api/tours"],
  ["sales", "/api/sales"],
  ["dashboard", "/api/dashboard"],
  ["upload", "/api/uploads"],
];

routes.forEach(([file, endpoint]) => {
  const routePath = path.join(__dirname, "routes", `${file}.js`);
  if (fs.existsSync(routePath)) {
    app.use(endpoint, require(routePath));
    console.log(`✅ Route loaded: ${endpoint}`);
  } else console.warn(`⚠️ Route file not found: ${routePath}`);
});

// Health check
app.get("/api/health", (_, res) => res.json({ status: "OK", time: new Date() }));

// SPA fallback
app.get("*", (_, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, () => console.log(`🌍 Server running on port ${PORT}`));
