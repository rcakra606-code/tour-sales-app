// =====================================
// ✅ Dashboard Controller
// =====================================
const db = require("../config/database");

exports.getDashboardData = (req, res) => {
  try {
    const totalSales = db.prepare("SELECT COUNT(*) AS total FROM sales").get().total;
    const totalTours = db.prepare("SELECT COUNT(*) AS total FROM tours").get().total;
    const totalRevenue = db.prepare("SELECT SUM(amount) AS total FROM sales").get().total || 0;

    res.json({
      success: true,
      data: { totalSales, totalTours, totalRevenue },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data dashboard.",
    });
  }
};
