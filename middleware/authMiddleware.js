/**
 * ✅ Auth Middleware
 * Melindungi semua route yang memerlukan JWT authentication.
 * Mengizinkan rute public seperti /api/auth/login, /api/auth/register, /public/*, /health.
 */

const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_env";

function authMiddleware(req, res, next) {
  try {
    // === Izinkan rute public tanpa token ===
    const openPaths = [
      "/api/auth/login",
      "/api/auth/register",
      "/health"
    ];

    if (
      openPaths.includes(req.path) ||
      req.path.startsWith("/public") ||
      req.path.startsWith("/css") ||
      req.path.startsWith("/js")
    ) {
      return next();
    }

    // === Cek header Authorization ===
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      logger.warn(`Unauthorized access attempt: ${req.path} (no Authorization header)`);
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      logger.warn(`Unauthorized access attempt: ${req.path} (no token part)`);
      return res.status(401).json({ message: "Missing token" });
    }

    // === Verifikasi JWT ===
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // simpan data user (id, username, type)

    logger.debug(`✅ Authenticated user: ${decoded.username || decoded.id}`);
    next();

  } catch (err) {
    logger.error(`JWT verification failed: ${err.message}`);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
