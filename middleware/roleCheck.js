/**
 * ==========================================================
 * middleware/roleCheck.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ Role-Based Access Control (RBAC)
 * ✅ Dipakai di seluruh route (users, sales, documents, logs, dll)
 * ✅ Kompatibel PostgreSQL + Render
 * ==========================================================
 */

/**
 * @function requireRole
 * Middleware untuk membatasi akses berdasarkan role user
 *
 * @param {...string} allowedRoles - daftar role yang diizinkan (misal: "super", "semi")
 * @returns middleware Express
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Tidak terautentikasi" });
      }

      const userRole = req.user.type?.toLowerCase();

      if (!allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
        console.warn(`🚫 Akses ditolak: ${req.user.username} mencoba mengakses dengan role '${userRole}'`);
        return res.status(403).json({ error: "Akses ditolak — Role tidak diizinkan" });
      }

      next();
    } catch (err) {
      console.error("❌ Error di middleware requireRole:", err.message);
      res.status(500).json({ error: "Terjadi kesalahan saat validasi role" });
    }
  };
}

module.exports = { requireRole };
