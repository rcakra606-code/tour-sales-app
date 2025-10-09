const express = require('express');
const { getAllTours, createTour } = require('../controllers/tourController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);
router.get('/', getAllTours);
router.post('/', createTour);
module.exports = router;
