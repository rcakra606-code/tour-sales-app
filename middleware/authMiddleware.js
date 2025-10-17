/**
 * ✅ Auth Middleware
 * Memverifikasi JWT token dari header Authorization.
 * Jika token valid → lanjut ke route berikutnya.
 * Jika tidak → tolak dengan status 401.
 */

const jwt = require("jsonwebtoken");
const { logger } = require("../config/logger");

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret_key"; // fallback dev

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Token tidak ditemukan." });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "Token tidak valid." });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // simpan data user di request
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    if (logger && typeof logger.error === "function") logger.error("Auth error: " + err.message);
    return res.status(401).json({ message: "Token tidak valid atau sudah kadaluarsa." });
  }
};
