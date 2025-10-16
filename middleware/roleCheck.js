// middleware/roleCheck.js
module.exports = function (allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.type)) {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    next();
  };
};
