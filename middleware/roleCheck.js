// middleware/roleCheck.js
module.exports = function (allowedRoles = []) {
  return (req, res, next) => {
    const userType = req.user?.type || "basic";
    if (!allowedRoles.includes(userType)) {
      return res.status(403).json({ message: "Akses ditolak. Role tidak sesuai." });
    }
    next();
  };
};
