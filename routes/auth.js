const express = require('express');
const router = express.Router();
const { loginUser, registerUser, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
