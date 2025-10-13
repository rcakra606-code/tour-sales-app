const db = require("../config/database");

exports.getDashboardStats = (req, res) => {
  try {
    const totalTours = db.prepare("SELECT COUNT(*) AS total FROM tours").get().total;
    const totalSales = db.prepare("SELECT COUNT(*) AS total FROM sales").get().total;
    const totalRevenue = db.prepare("SELECT SUM(amount) AS total FROM sales").get().total || 0;

    const latestSales = db
      .prepare(`
        SELECT s.*, t.title AS tour_title 
        FROM sales s
        LEFT JOIN tours t ON s.tour_id = t.id
        ORDER BY s.date DESC LIMIT 5
      `)
      .all();

    res.json({
      totalTours,
      totalSales,
      totalRevenue,
      latestSales,
    });
  } catch (err) {
    console.error("❌ Dashboard stats error:", err);
    res.status(500).json({ message: "Gagal mengambil statistik dashboard." });
  }
};
