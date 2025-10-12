// routes/tours.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/tourController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Semua route butuh autentikasi
router.use(authenticateToken);

// GET /api/tours
router.get('/', controller.getAll);

// POST /api/tours  (boleh staff/admin)
router.post('/', controller.create);

// PUT /api/tours/:id  (hanya admin atau creator - untuk sederhana kita minta admin)
router.put('/:id', requireRole('admin'), controller.update);

// DELETE /api/tours/:id (hanya admin)
router.delete('/:id', requireRole('admin'), controller.remove);

module.exports = router;
