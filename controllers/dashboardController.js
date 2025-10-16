// controllers/dashboardController.js
const db = require("../config/database");

exports.getSummary = (req, res) => {
  try {
    const totalSales = db.prepare("SELECT SUM(salesAmount) as totalSales FROM sales").get().totalSales || 0;
    const totalProfit = db.prepare("SELECT SUM(profitAmount) as totalProfit FROM sales").get().totalProfit || 0;
    const totalRegistrants = db.prepare("SELECT COUNT(*) as count FROM tours").get().count || 0;
    const totalPax = db.prepare("SELECT SUM(paxCount) as pax FROM tours").get().pax || 0;

    res.json({
      totalSales,
      totalProfit,
      totalRegistrants,
      totalPax,
    });
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
};
