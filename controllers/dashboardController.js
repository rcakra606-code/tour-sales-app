const db = require("../config/database");
const { logger } = require("../utils/logger");

/**
 * 📊 Dashboard Summary Controller
 * Returns total tours, sales, profit, and staff activity summary.
 */
exports.getDashboardSummary = (req, res) => {
  try {
    const totalTours = db.prepare("SELECT COUNT(*) AS total FROM tours").get().total;
    const totalSales = db.prepare("SELECT COUNT(*) AS total FROM sales").get().total;

    const totalRevenue = db.prepare("SELECT IFNULL(SUM(salesAmount), 0) AS total FROM sales").get().total;
    const totalProfit = db.prepare("SELECT IFNULL(SUM(profitAmount), 0) AS total FROM sales").get().total;

    const topStaff = db.prepare(`
      SELECT staff, COUNT(*) AS transactions, SUM(salesAmount) AS totalSales
      FROM sales
      WHERE staff IS NOT NULL
      GROUP BY staff
      ORDER BY totalSales DESC
      LIMIT 5
    `).all();

    const topRegions = db.prepare(`
      SELECT region, COUNT(*) AS tourCount, SUM(tourPrice) AS totalValue
      FROM tours
      WHERE region IS NOT NULL
      GROUP BY region
      ORDER BY totalValue DESC
      LIMIT 5
    `).all();

    return res.json({
      success: true,
      data: {
        totalTours,
        totalSales,
        totalRevenue,
        totalProfit,
        topStaff,
        topRegions,
      },
    });
  } catch (err) {
    logger.error("❌ Dashboard summary error: " + err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
