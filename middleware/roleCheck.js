// ==========================================================
// 🧩 Travel Dashboard Enterprise v5.3
// Role-Based Access Middleware (Admin / SemiAdmin / Staff)
// ==========================================================

export function roleCheck(allowedRoles = []) {
  return (req, res, next) => {
    try {
      const user = req.user; // sudah didekode dari JWT di authMiddleware.js
      if (!user || !user.role) {
        return res.status(401).json({ message: "Unauthorized: No user context" });
      }

      const role = user.role.toLowerCase();

      // jika role diizinkan
      if (allowedRoles.includes(role)) {
        return next();
      }

      // jika tidak diizinkan
      return res.status(403).json({
        message: `Access denied: Role '${role}' tidak memiliki izin untuk mengakses resource ini`,
      });
    } catch (err) {
      console.error("❌ Role check error:", err);
      return res.status(500).json({ message: "Internal Server Error (roleCheck)" });
    }
  };
}

// ==========================================================
// 📘 Quick Usage Reference
// ==========================================================
//
// Import di route:
// import { roleCheck } from "../middleware/roleCheck.js";
//
// Contoh pemakaian:
//
// router.get("/admin-only", authMiddleware, roleCheck(["admin"]), (req, res) => {...});
//
// router.post("/edit-data", authMiddleware, roleCheck(["semiadmin", "admin"]), (req, res) => {...});
//
// router.get("/staff-data", authMiddleware, roleCheck(["staff", "semiadmin", "admin"]), (req, res) => {...});
//