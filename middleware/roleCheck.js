/**
 * ==========================================================
 * 📁 middleware/roleCheck.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Middleware untuk membatasi akses berdasarkan role user:
 * - super → akses penuh
 * - semi → akses terbatas
 * - basic → hanya bisa view
 * ==========================================================
 */

/**
 * 🧩 Middleware Role Check
 * @param {Array} allowedRoles - daftar role yang diizinkan mengakses route
 */
export const roleCheck = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Akses ditolak. User tidak terautentikasi." });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Anda tidak memiliki hak akses (${req.user.role}).`,
        });
      }

      next();
    } catch (err) {
      console.error("❌ Role check error:", err.message);
      res.status(500).json({ message: "Terjadi kesalahan otorisasi." });
    }
  };
};