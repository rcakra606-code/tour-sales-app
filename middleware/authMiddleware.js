// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Jika header tidak ada → tolak
  if (!authHeader) {
    return res.status(403).json({ error: "No token provided" });
  }

  // Format harus: Bearer <token>
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "Malformed token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
