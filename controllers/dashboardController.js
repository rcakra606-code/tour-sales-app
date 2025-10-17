// controllers/dashboardController.js
const db = require("../config/database");
const { logger } = require("../config/logger");

exports.getSummary = (req, res) => {
  try {
    const totalSales = db.prepare("SELECT SUM(salesAmount) as totalSales FROM sales").get()?.totalSales || 0;
    const totalProfit = db.prepare("SELECT SUM(profitAmount) as totalProfit FROM sales").get()?.totalProfit || 0;
    const totalRegistrants = db.prepare("SELECT COUNT(*) as count FROM tours").get()?.count || 0;
    const totalPax = db.prepare("SELECT SUM(paxCount) as pax FROM tours").get()?.pax || 0;

    res.json({ totalSales, totalProfit, totalRegistrants, totalPax });
  } catch (err) {
    logger.error("❌ dashboard.getSummary failed: " + err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getCharts = (req, res) => {
  try {
    const staffRows = db
      .prepare(`
        SELECT staff, SUM(salesAmount) AS sales, SUM(profitAmount) AS profit
        FROM sales
        GROUP BY staff
      `)
      .all();

    const regionRows = db
      .prepare(`
        SELECT region, COUNT(*) AS count
        FROM tours
        GROUP BY region
      `)
      .all();

    res.json({ staffRows, regionRows });
  } catch (err) {
    logger.error("❌ dashboard.getCharts failed: " + err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getSalesOverview = (req, res) => {
  try {
    const rows = db
      .prepare(`
        SELECT DATE(transactionDate) as date,
               SUM(salesAmount) as totalSales,
               SUM(profitAmount) as totalProfit
        FROM sales
        GROUP BY DATE(transactionDate)
        ORDER BY date DESC
        LIMIT 14
      `)
      .all();

    res.json({ daily: rows });
  } catch (err) {
    logger.error("❌ dashboard.getSalesOverview failed: " + err.message);
    res.status(500).json({ error: err.message });
  }
};
