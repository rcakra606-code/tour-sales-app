module.exports = function (role) {
  return function (req, res, next) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Akses ditolak. Role tidak sesuai." });
    }
    next();
  };
};
