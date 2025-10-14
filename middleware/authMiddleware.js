// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_env";

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token provided" });
  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ message: "Token error" });
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // attach user info from token (id, username, type)
    req.user = decoded;
    // Optionally refresh user info from db
    const user = db.prepare("SELECT id,name,username,email,type,role FROM users WHERE id = ?").get(decoded.id);
    if (user) req.user = { ...req.user, ...user };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
}

module.exports = authMiddleware;
