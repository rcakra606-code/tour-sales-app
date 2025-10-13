const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");
const http = require("http");
require("dotenv").config();

// DB Setup
const Database = require("better-sqlite3");
const dbFile = path.join(__dirname, "data", "travel.db");
if (!fs.existsSync(path.join(__dirname, "data"))) fs.mkdirSync(path.join(__dirname, "data"));
const db = new Database(dbFile);

// Create default admin if not exist
db.prepare(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)`).run();
const admin = db.prepare(`SELECT * FROM users WHERE username=?`).get("admin");
if (!admin) {
  const bcrypt = require("bcryptjs");
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare(`INSERT INTO users (username,password,role) VALUES (?,?,?)`).run("admin", hash, "admin");
  console.log("🧩 Admin default dibuat → username: admin | password: admin123");
}

// Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false // CSP handled in frontend
  })
);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tours", require("./routes/tours"));
app.use("/api/sales", require("./routes/sales"));

// Health
app.get("/api/health", (req, res) => res.json({ status: "OK", node: process.version }));

// SPA fallback
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// Start server
const PORT = process.env.PORT || 3000;
http.createServer(app).listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
