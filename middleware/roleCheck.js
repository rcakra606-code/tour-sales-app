// middleware/roleCheck.js
/**
 * Middleware untuk validasi role user
 * Contoh penggunaan:
 *   router.post("/create", roleCheck(["admin", "super"]), controller.createRegion);
 */

function roleCheck(allowedRoles = []) {
  return (req, res, next) => {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Unauthorized - no user data" });

    const role = user.type || user.role || "basic";
    if (!allowedRoles.includes(role)) {
      return res
        .status(403)
        .json({ message: "Forbidden - insufficient privileges" });
    }

    next();
  };
}

module.exports = roleCheck;
