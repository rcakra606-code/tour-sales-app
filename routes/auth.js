const express = require('express');
const router = express.Router();

// Dummy admin account
const ADMIN_USER = { username: 'admin', password: 'admin123' };

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    // kirim token sederhana
    return res.json({ token: 'fake-jwt-token', username });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
