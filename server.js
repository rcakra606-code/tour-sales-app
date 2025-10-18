const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const { initDB } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://cdn.tailwindcss.com",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(bodyParser.json());

// static frontend
app.use(express.static(path.join(__dirname, "public")));

// init DB
initDB();

// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/tours", require("./routes/tours"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/documents", require("./routes/documents"));
app.use("/api/users", require("./routes/users"));
app.use("/api/regions", require("./routes/regions"));
app.use("/api/logs", require("./routes/logs"));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/login.html")));
app.get("/dashboard.html", (req, res) => res.sendFile(path.join(__dirname, "public/dashboard.html")));

app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));
