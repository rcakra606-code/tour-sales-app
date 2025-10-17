/**
 * 🧭 Role Check Middleware
 */
function roleCheck(requiredRoles = []) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (!requiredRoles.includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
}

module.exports = roleCheck;
