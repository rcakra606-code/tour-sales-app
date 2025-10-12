// controllers/dashboardController.js
const db = require("../config/database");

exports.getDashboardSummary = (req, res) => {
  try {
    const totalTours = db.prepare("SELECT COUNT(*) as count FROM tours").get()?.count || 0;
    const totalSales = db.prepare("SELECT COUNT(*) as count FROM sales").get()?.count || 0;
    const totalAmount = db.prepare("SELECT SUM(amount) as total FROM sales").get()?.total || 0;

    res.json({
      success: true,
      data: {
        totalTours,
        totalSales,
        totalAmount,
      },
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err.message);
    res.status(500).json({ success: false, message: "Gagal memuat data dashboard" });
  }
};
