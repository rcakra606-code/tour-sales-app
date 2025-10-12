// =====================================
// ✅ Dashboard Controller (Final Compatible)
// =====================================
const db = require("../config/database");

// Fungsi utama untuk ambil data ringkasan dashboard
exports.getDashboardData = (req, res) => {
  try {
    // Gunakan better-sqlite3 (sinkron, cepat, tanpa callback)
    const totalSales =
      db.prepare("SELECT COUNT(*) AS total FROM sales").get()?.total || 0;

    const totalTours =
      db.prepare("SELECT COUNT(*) AS total FROM tours").get()?.total || 0;

    // Kolom "status" belum ada di schema tours kamu,
    // jadi kita pastikan query ini aman tanpa error
    let pendingTours = 0;
    try {
      const statusCheck = db
        .prepare(
          "SELECT name FROM pragma_table_info('tours') WHERE name = 'status'"
        )
        .get();
      if (statusCheck) {
        pendingTours =
          db
            .prepare(
              "SELECT COUNT(*) AS total FROM tours WHERE status = 'pending'"
            )
            .get()?.total || 0;
      }
    } catch {
      pendingTours = 0;
    }

    // Kirim hasil ke frontend
    res.json({
      success: true,
      data: {
        totalSales,
        totalTours,
        pendingTours,
      },
    });
  } catch (error) {
    console.error("❌ Dashboard Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data dashboard.",
    });
  }
};
