// controllers/dashboardController.js
const db = require('../config/db'); // Pastikan file ini sesuai dengan koneksi SQLite kamu

exports.getDashboardSummary = async (req, res) => {
  try {
    // Hitung total sales & tours
    const salesResult = await db.all('SELECT COUNT(*) AS total FROM sales');
    const toursResult = await db.all('SELECT COUNT(*) AS total FROM tours');

    const totalSales = salesResult?.[0]?.total || 0;
    const totalTours = toursResult?.[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalSales,
        totalTours,
      },
    });
  } catch (err) {
    console.error('Dashboard Error:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal memuat data dashboard',
      error: err.message,
    });
  }
};
