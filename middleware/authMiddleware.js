// middleware/authMiddleware.js
module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ada." });
  }

  const token = authHeader.split(" ")[1];
  if (token !== "fake-jwt-token") {
    return res.status(403).json({ message: "Token tidak valid." });
  }

  req.user = { username: "admin" }; // simulasi decode token
  next();
};
