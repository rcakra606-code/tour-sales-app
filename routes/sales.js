const express = require('express');
const { getAllSales, createSales } = require('../controllers/salesController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);
router.get('/', getAllSales);
router.post('/', createSales);
module.exports = router;
