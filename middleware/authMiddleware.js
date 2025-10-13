const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Token tidak ditemukan" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    req.user = decoded;
    next();
  });
};
