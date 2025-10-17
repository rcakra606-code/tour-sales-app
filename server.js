// inside server.js
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// === ROUTES ===
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// protect dashboard routes
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Unauthorized" });
  const token = header.split(" ")[1];
  const jwt = require("jsonwebtoken");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// example protected route
app.get("/api/dashboard/summary", authMiddleware, (req, res) => {
  // ... your existing summary logic here
});

// fallback
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
