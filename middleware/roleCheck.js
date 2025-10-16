// middleware/roleCheck.js
/**
 * Middleware untuk memeriksa hak akses pengguna berdasarkan role/type.
 * - Mendukung string tunggal atau array.
 * - Contoh:
 *    router.post("/regions", roleCheck(["super","semi"]), regionController.create);
 */
module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userRole = req.user.type || req.user.role || "basic";
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!allowed.includes(userRole)) {
      return res.status(403).json({ message: "Access denied for role: " + userRole });
    }

    next();
  };
};
