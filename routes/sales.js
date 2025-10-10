// ================================
// ✅ SALES ROUTES
// ================================
const express = require('express');
const router = express.Router();

// Controllers
const { getAllSales, createSales } = require('../controllers/salesController');

// Middleware auth (dummy JWT)
const { authenticateToken } = require('../middleware/auth');

// ================================
// ✅ Middleware Proteksi Token
// ================================
router.use(authenticateToken);

// ================================
// ✅ Routes
// ================================
/**
 * @route GET /api/sales
 * @desc Ambil semua data sales
 */
router.get('/', async (req, res) => {
  try {
    const sales = await getAllSales();
    return res.json({ sales }); // gunakan format konsisten { sales: [...] }
  } catch (err) {
    console.error('Error get sales:', err);
    return res.status(500).json({ message: 'Gagal memuat data sales' });
  }
});

/**
 * @route POST /api/sales
 * @desc Tambah data sales baru
 */
router.post('/', async (req, res) => {
  try {
    const newSales = await createSales(req.body);
    return res.status(201).json({ message: 'Sales berhasil ditambahkan', sales: newSales });
  } catch (err) {
    console.error('Error create sales:', err);
    return res.status(500).json({ message: 'Gagal menambahkan sales' });
  }
});

module.exports = router;
