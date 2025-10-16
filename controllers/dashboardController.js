// controllers/dashboardController.js
const db = require("../config/database");

exports.getSummary = (req, res) => {
  try {
    const totalSales = db.prepare("SELECT SUM(salesAmount) as total FROM sales").get()?.total || 0;
    const totalProfit = db.prepare("SELECT SUM(profitAmount) as total FROM sales").get()?.total || 0;
    const totalRegistrants = db.prepare("SELECT COUNT(*) as total FROM tours").get()?.total || 0;
    const totalPax = db.prepare("SELECT SUM(paxCount) as total FROM tours").get()?.total || 0;

    res.json({ totalSales, totalProfit, totalRegistrants, totalPax });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCharts = (req, res) => {
  try {
    const staffRows = db.prepare(`
      SELECT staff, SUM(salesAmount) as sales, SUM(profitAmount) as profit
      FROM sales GROUP BY staff
    `).all();

    const regionRows = db.prepare(`
      SELECT region, COUNT(*) as count
      FROM tours GROUP BY region
    `).all();

    res.json({ staffRows, regionRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
