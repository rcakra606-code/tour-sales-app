// controllers/dashboardController.js — Executive Dashboard Analytics
const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

exports.getExecutiveSummary = (req, res) => {
  try {
    const user = req.user;
    const { startDate, endDate } = req.query;
    const filters = [];
    const params = [];

    // Role filter
    if (user.type === "basic") {
      filters.push("staff = ?");
      params.push(user.username);
    }

    // Date filter
    if (startDate && endDate) {
      filters.push("date(reportDate) BETWEEN date(?) AND date(?)");
      params.push(startDate, endDate);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    /* === TOURS === */
    const tourStats = db.prepare(`
      SELECT 
        COUNT(*) AS totalTours,
        SUM(salesAmount) AS totalSales,
        SUM(profitAmount) AS totalProfit
      FROM report_tours ${where}
    `).get(...params);

    const tourByRegion = db.prepare(`
      SELECT region, COUNT(*) AS totalTours, SUM(profitAmount) AS totalProfit
      FROM report_tours ${where}
      GROUP BY region
      ORDER BY totalProfit DESC
    `).all(...params);

    const tourByStatus = db.prepare(`
      SELECT departureStatus, COUNT(*) AS total 
      FROM report_tours ${where}
      GROUP BY departureStatus
    `).all(...params);

    /* === SALES === */
    const salesStats = db.prepare(`
      SELECT 
        SUM(salesAmount) AS totalSales,
        SUM(profitAmount) AS totalProfit,
        SUM(totalInvoices) AS totalInvoices
      FROM report_sales ${where}
    `).get(...params);

    const salesByStaff = db.prepare(`
      SELECT staff, SUM(salesAmount) AS totalSales, SUM(profitAmount) AS totalProfit
      FROM report_sales ${where}
      GROUP BY staff
      ORDER BY totalSales DESC
    `).all(...params);

    /* === DOCUMENTS === */
    const docStats = db.prepare(`
      SELECT 
        SUM(totalFiles) AS totalFiles,
        SUM(completed) AS completed,
        SUM(pending) AS pending,
        SUM(rejected) AS rejected
      FROM report_documents ${where}
    `).get(...params);

    res.json({
      tours: tourStats || {},
      tourByRegion,
      tourByStatus,
      sales: salesStats || {},
      salesByStaff,
      documents: docStats || {},
    });
  } catch (err) {
    console.error("getExecutiveSummary error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data dashboard." });
  }
};
