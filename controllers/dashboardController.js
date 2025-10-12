// =====================================
// ✅ Dashboard Controller (Final)
// =====================================
const db = require("../config/database");

exports.getDashboardData = async (req, res) => {
  try {
    // Ambil jumlah sales
    const totalSales =
      db.prepare("SELECT COUNT(*) AS total FROM sales").get()?.total || 0;

    // Ambil jumlah tours
    const totalTours =
      db.prepare("SELECT COUNT(*) AS total FROM tours").get()?.total || 0;

    // Jika kamu punya kolom status di tabel tours
    let pendingTours = 0;
    try {
      pendingTours =
        db.prepare(
          "SELECT COUNT(*) AS total FROM tours WHERE status = 'pending'"
        ).get()?.total || 0;
    } catch {
      pendingTours = 0;
    }

    res.json({
      success: true,
      data: { totalSales, totalTours, pendingTours },
    });
  } catch (error) {
    console.error("❌ Dashboard Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data dashboard.",
    });
  }
};
