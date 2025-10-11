// ===============================
// ✅ Auth Routes
// ===============================
const express = require('express');
const router = express.Router();

const { login, register, profile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// ===============================
// ✅ PUBLIC ROUTES
// ===============================

// POST /api/auth/login → Login user
router.post('/login', login);

// POST /api/auth/register → Register user baru (opsional)
router.post('/register', register);

// ===============================
// ✅ PROTECTED ROUTES (JWT REQUIRED)
// ===============================

// GET /api/auth/profile → Dapatkan info user berdasarkan JWT
router.get('/profile', authenticateToken, profile);

module.exports = router;
