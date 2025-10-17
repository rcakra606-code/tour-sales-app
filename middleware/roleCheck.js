/**
 * ✅ Role Check Middleware
 * Mengecek apakah user memiliki peran (role) tertentu untuk mengakses route.
 * Contoh penggunaan:
 * router.get("/admin-only", roleCheck("admin"), controller.adminPage);
 */

const { logger } = require("../config/logger");

module.exports = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Akses ditolak. Data user tidak valid." });
      }

      if (req.user.role !== requiredRole) {
        return res.status(403).json({ message: `Akses ditolak. Hanya untuk role: ${requiredRole}.` });
      }

      next();
    } catch (err) {
      console.error("❌ Role check error:", err.message);
      if (logger && typeof logger.error === "function") logger.error("Role check error: " + err.message);
      res.status(500).json({ message: "Kesalahan server saat memverifikasi role." });
    }
  };
};
