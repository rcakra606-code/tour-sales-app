/**
 * ✅ Dashboard Controller
 * Menyediakan data summary, chart, dan overview untuk dashboard utama.
 */

const db = require("../config/database");
const { logger } = require("../config/logger");

// --- GET /api/dashboard/summary ---
exports.getSummary = (req, res) => {
  try {
    const totalSales = db.prepare("SELECT SUM(salesAmount) AS totalSales FROM sales").get()?.totalSales || 0;
    const totalProfit = db.prepare("SELECT SUM(profitAmount) AS totalProfit FROM sales").get()?.totalProfit || 0;
    const totalRegistrants = db.prepare("SELECT COUNT(*) AS count FROM tours").get()?.count || 0;
    const totalPax = db.prepare("SELECT SUM(paxCount) AS pax FROM tours").get()?.pax || 0;

    res.json({ totalSales, totalProfit, totalRegistrants, totalPax });
  } catch (err) {
    console.error("❌ dashboard.getSummary failed:", err.message);
    if (logger && typeof logger.error === "function") logger.error(err.message);
    res.status(500).json({ error: "Gagal memuat data summary." });
  }
};

// --- GET /api/dashboard/charts ---
exports.getCharts = (req, res) => {
  try {
    const staffRows = db.prepare(`
      SELECT staff, SUM(salesAmount) AS sales, SUM(profitAmount) AS profit
      FROM sales
      GROUP BY staff
    `).all();

    const regionRows = db.prepare(`
      SELECT region, COUNT(*) AS count
      FROM tours
      GROUP BY region
    `).all();

    res.json({ staffRows, regionRows });
  } catch (err) {
    console.error("❌ dashboard.getCharts failed:", err.message);
    if (logger && typeof logger.error === "function") logger.error(err.message);
    res.status(500).json({ error: "Gagal memuat data chart." });
  }
};

// --- GET /api/dashboard/sales-overview ---
exports.getSalesOverview = (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT DATE(transactionDate) AS date,
             SUM(salesAmount) AS totalSales,
             SUM(profitAmount) AS totalProfit
      FROM sales
      GROUP BY DATE(transactionDate)
      ORDER BY date DESC
      LIMIT 14
    `).all();

    res.json({ daily: rows });
  } catch (err) {
    console.error("❌ dashboard.getSalesOverview failed:", err.message);
    if (logger && typeof logger.error === "function") logger.error(err.message);
    res.status(500).json({ error: "Gagal memuat data sales overview." });
  }
};

// --- (Opsional) GET /api/dashboard/report ---
exports.exportReport = (req, res) => {
  res.status(501).json({ message: "Fitur export report belum diimplementasikan." });
};
