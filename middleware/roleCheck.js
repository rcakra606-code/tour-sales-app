/**
 * =======================================
 * 🛡️ ROLE-BASED ACCESS CONTROL MIDDLEWARE
 * =======================================
 */
module.exports = function roleCheck(roles = []) {
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized: Missing user data" });
    }

    const userRole = req.user.role;
    if (roles.length && !roles.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden: Role '${userRole}' not authorized for this route`,
      });
    }

    next();
  };
};
