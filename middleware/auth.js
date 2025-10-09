const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const h = req.headers['authorization'];
  const token = h && h.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const r = await pool.query('SELECT id,username,name,email,role FROM users WHERE id=$1', [decoded.userId]);
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid token' });
    req.user = r.rows[0];
    next();
  } catch (e) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => (req,res,next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error:'Insufficient permissions' });
  next();
};

module.exports = { authenticateToken, requireRole };
