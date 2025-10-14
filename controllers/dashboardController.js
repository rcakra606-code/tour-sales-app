// controllers/dashboardController.js
const db = require("../config/database");

// GET /api/dashboard/summary
exports.summary = (req, res) => {
  try {
    const totalSales = db.prepare("SELECT IFNULL(SUM(salesAmount),0) as total FROM tours").get().total;
    const totalProfit = db.prepare("SELECT IFNULL(SUM(profitAmount),0) as total FROM tours").get().total;
    const totalRegistrants = db.prepare("SELECT COUNT(*) as cnt FROM tours").get().cnt;
    const totalPax = db.prepare("SELECT IFNULL(SUM(paxCount),0) as pax FROM tours").get().pax;

    res.json({ totalSales, totalProfit, totalRegistrants, totalPax });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/dashboard/charts
exports.charts = (req, res) => {
  try {
    // sales/profit per staff
    const staffRows = db.prepare(`
      SELECT staff, IFNULL(SUM(salesAmount),0) as sales, IFNULL(SUM(profitAmount),0) as profit
      FROM tours
      GROUP BY staff
    `).all();

    // region distribution
    const regionRows = db.prepare(`
      SELECT region, COUNT(*) as count
      FROM tours
      GROUP BY region
    `).all();

    res.json({ staffRows, regionRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
