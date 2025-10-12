// =====================================
// ✅ Role-based Access Middleware
// =====================================
module.exports = function (roles = []) {
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Akses ditolak: role tidak diizinkan" });
      }

      next();
    } catch (err) {
      console.error("Role check error:", err);
      res.status(500).json({ message: "Kesalahan sistem otorisasi." });
    }
  };
};
