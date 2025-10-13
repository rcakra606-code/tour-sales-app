// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// ============ HELPER UNTUK REGISTER ROUTES ============
function useRoute(basePath, routeFile) {
  try {
    const routePath = path.join(__dirname, "routes", routeFile);
    const route = require(routePath);
    app.use(basePath, route);
    console.log(`✅ Route aktif: ${basePath} → ${routeFile}.js`);
  } catch (err) {
    console.error(`❌ Gagal load route ${routeFile}:`, err.message);
  }
}

// ============ REGISTER SEMUA ROUTES ============
useRoute("/api/auth", "auth");
useRoute("/api/tours", "tours");
useRoute("/api/sales", "sales");
useRoute("/api/dashboard", "dashboard");
useRoute("/api/uploads", "upload");

// ============ DEFAULT / ROOT ============
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============ ERROR HANDLER ============
app.use((req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
