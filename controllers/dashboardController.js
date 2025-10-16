// controllers/dashboardController.js
const db = require("../config/database");

/**
 * 🔹 Dashboard Summary Utama
 * Total sales, profit, jumlah registrasi, dan total pax
 */
exports.getSummary = (req, res) => {
  try {
    const totalSales = db.prepare("SELECT SUM(salesAmount) AS totalSales FROM sales").get()?.totalSales || 0;
    const totalProfit = db.prepare("SELECT SUM(profitAmount) AS totalProfit FROM sales").get()?.totalProfit || 0;
    const totalRegistrants = db.prepare("SELECT COUNT(*) AS count FROM tours").get()?.count || 0;
    const totalPax = db.prepare("SELECT SUM(paxCount) AS pax FROM tours").get()?.pax || 0;

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

/**
 * 🔹 Data Chart Utama (Per Staff & Per Region)
 */
exports.getCharts = (req, res) => {
  try {
    const staffRows = db
      .prepare(`
        SELECT staff, 
               SUM(salesAmount) AS sales, 
               SUM(profitAmount) AS profit
        FROM sales
        GROUP BY staff
        ORDER BY sales DESC
      `)
      .all();

    const regionRows = db
      .prepare(`
        SELECT region, 
               COUNT(*) AS count
        FROM tours
        GROUP BY region
        ORDER BY count DESC
      `)
      .all();

    res.json({ staffRows, regionRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🔹 Dashboard Sales Harian (14 hari terakhir)
 */
exports.getSalesOverview = (req, res) => {
  try {
    const rows = db
      .prepare(`
        SELECT 
          DATE(transactionDate) AS date, 
          SUM(salesAmount) AS totalSales, 
          SUM(profitAmount) AS totalProfit
        FROM sales
        WHERE transactionDate >= DATE('now', '-14 day')
        GROUP BY DATE(transactionDate)
        ORDER BY DATE(transactionDate) ASC
      `)
      .all();

    res.json({ daily: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🔹 Export Laporan (CSV/PDF)
 * Digunakan di halaman Document / Report
 */
exports.exportReport = (req, res) => {
  try {
    const rows = db
      .prepare(`
        SELECT 
          t.registrationDate,
          t.tourCode,
          t.region,
          t.leadPassenger,
          s.staff,
          s.salesAmount,
          s.profitAmount
        FROM tours t
        LEFT JOIN sales s ON t.staff = s.staff
        ORDER BY t.registrationDate DESC
      `)
      .all();

    res.json({ report: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
