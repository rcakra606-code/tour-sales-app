// =====================================
// ✅ Dashboard Controller
// =====================================
const db = require("../config/database");

exports.getDashboardData = async (req, res) => {
  try {
    const totalSales = db.prepare("SELECT COUNT(*) AS total FROM sales").get()?.total || 0;
    const totalTours = db.prepare("SELECT COUNT(*) AS total FROM tours").get()?.total || 0;
    const pendingTours = db.prepare(
      "SELECT COUNT(*) AS total FROM tours WHERE status = 'pending'"
    ).get()?.total || 0;

    res.json({
      success: true,
      data: { totalSales, totalTours, pendingTours },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data dashboard.",
    });
  }
};
