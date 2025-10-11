// =====================================
// ✅ Dashboard Controller
// =====================================
const db = require("../config/db");

exports.getDashboardData = async (req, res) => {
  try {
    const totalSales = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) AS total FROM sales", (err, row) => {
        if (err) reject(err);
        else resolve(row.total || 0);
      });
    });

    const totalTours = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) AS total FROM tours", (err, row) => {
        if (err) reject(err);
        else resolve(row.total || 0);
      });
    });

    const pendingTours = await new Promise((resolve, reject) => {
      db.get(
        "SELECT COUNT(*) AS total FROM tours WHERE status = 'pending'",
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total || 0);
        }
      );
    });

    res.json({
      success: true,
      data: {
        totalSales,
        totalTours,
        pendingTours,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data dashboard.",
    });
  }
};
