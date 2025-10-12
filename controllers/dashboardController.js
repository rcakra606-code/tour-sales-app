// =====================================
// ✅ Dashboard Controller (Final)
// =====================================
const db = require("../config/database");

exports.getDashboardData = async (req, res) => {
  try {
    // Hitung total penjualan (jumlah transaksi)
    const totalSales = db.prepare("SELECT COUNT(*) AS total FROM sales").get().total || 0;

    // Hitung total tours
    const totalTours = db.prepare("SELECT COUNT(*) AS total FROM tours").get().total || 0;

    // Hitung tour yang belum dijalankan (opsional: jika punya kolom status)
    let pendingTours = 0;
    try {
      const check = db.prepare("PRAGMA table_info(tours)").all();
      const hasStatus = check.some(c => c.name === "status");
      if (hasStatus) {
        pendingTours = db
          .prepare("SELECT COUNT(*) AS total FROM tours WHERE status = 'pending'")
          .get().total || 0;
      }
    } catch {
      pendingTours = 0;
    }

    // Hitung total revenue (jumlah nominal dari tabel sales)
    const totalRevenue =
      db.prepare("SELECT SUM(amount) AS total FROM sales").get().total || 0;

    // Respon ke frontend
    res.json({
      success: true,
      data: {
        totalSales,
        totalTours,
        pendingTours,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("❌ Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memuat data dashboard.",
    });
  }
};
