// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// Ensure db initialises
require("./config/database");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const salesRoutes = require("./routes/sales");
const toursRoutes = require("./routes/tours");
const documentsRoutes = require("./routes/documents");
const usersRoutes = require("./routes/users");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/users", usersRoutes);

// Serve frontend static
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req,res) => res.sendFile(path.join(__dirname,"/public/index.html")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
