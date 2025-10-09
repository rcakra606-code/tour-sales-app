// routes/auth.js
const express = require('express');
const router = express.Router();

// Dummy admin credentials
const ADMIN_USER = { username: 'admin', password: 'admin123' };

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    return res.json({
      token: 'fake-jwt-token',
      username,
      message: 'Login successful',
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
