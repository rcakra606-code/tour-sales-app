/**
 * ==========================================================
 * middleware/roleCheck.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Role-Based Access Control (RBAC)
 * ✅ Cegah akses tanpa hak
 * ✅ Integrasi dengan verifyToken
 * ==========================================================
 */

const logger = require("../config/logger");

/**
 * @param {string[]} allowedRoles — daftar role yang diizinkan untuk route ini
 * @returns middleware function
 */
module.exports = function roleCheck(allowedRoles = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn("🚫 Akses ditolak: user belum terautentikasi");
        return res.status(401).json({ message: "User belum login atau token tidak valid" });
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        logger.warn(
          `🚫 Akses ditolak untuk user ${req.user.username} (role: ${userRole}), membutuhkan salah satu dari: ${allowedRoles.join(
            ", "
          )}`
        );
        return res.status(403).json({
          message: `Akses ditolak: role '${userRole}' tidak diizinkan untuk operasi ini`,
        });
      }

      next();
    } catch (err) {
      logger.error("❌ Error dalam roleCheck middleware:", err);
      res.status(500).json({ message: "Gagal memverifikasi role user" });
    }
  };
};
