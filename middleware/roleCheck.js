// middleware/roleCheck.js
module.exports = function(allowed = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const type = req.user.type || req.user.role || "basic";
    if (allowed.length === 0 || allowed.includes(type)) return next();
    return res.status(403).json({ message: "Forbidden: insufficient permissions" });
  };
};
