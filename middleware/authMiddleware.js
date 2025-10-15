// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_env";

function authMiddleware(req, res, next) {
  // izinkan request public tanpa token
  if (
    req.path === "/api/auth/login" ||
    req.path === "/api/auth/register" ||
    req.path.startsWith("/public") ||
    req.path === "/health"
  ) {
    return next();
  }

  // cek header Authorization
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // simpan data user di request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
