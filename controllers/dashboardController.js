// controllers/dashboardController.js
const db = require("../config/database");

exports.getDashboardStats = (req, res) => {
  const totalTours = db.prepare("SELECT COUNT(*) AS count FROM tours").get().count;
  const totalSales = db.prepare("SELECT COUNT(*) AS count FROM sales").get().count;
  const totalRevenue = db.prepare("SELECT SUM(total_amount) AS total FROM sales").get().total || 0;

  const recentSales = db
    .prepare(`
      SELECT s.*, t.title AS tour_title
      FROM sales s
      LEFT JOIN tours t ON s.tour_id = t.id
      ORDER BY s.sale_date DESC
      LIMIT 5
    `)
    .all();

  res.json({
    totalTours,
    totalSales,
    totalRevenue,
    recentSales,
  });
};
