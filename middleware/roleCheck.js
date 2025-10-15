// middleware/roleCheck.js

/**
 * Middleware untuk membatasi akses berdasarkan role/type user.
 * Contoh:
 *   app.get("/api/admin", roleCheck("super"), handler)
 *   app.post("/api/region", roleCheck("super", "semi"), handler)
 */

function roleCheck(...allowedRoles) {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized: user not found in token" });
      }

      const userRole = user.type || user.role || "basic";

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: `Access denied for role: ${userRole}` });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: "Role check failed", error: err.message });
    }
  };
}

module.exports = roleCheck;
