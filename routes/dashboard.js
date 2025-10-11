// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// Semua akses dashboard harus login
router.get('/', authenticateToken, getDashboardSummary);

module.exports = router;
