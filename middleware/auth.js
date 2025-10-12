// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ada.' });
    }
    const token = auth.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'secretkey';
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Token tidak valid.' });
      req.user = decoded; // { id, username, role, iat, exp }
      next();
    });
  } catch (e) {
    console.error('Auth middleware error', e);
    return res.status(500).json({ message: 'Server error (auth).' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Akses ditolak.' });
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Anda tidak memiliki hak akses.' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
