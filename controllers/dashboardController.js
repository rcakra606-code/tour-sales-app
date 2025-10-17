const db = require("../config/database");
const { logger } = require("../utils/logger");

/**
 * 📊 Get Summary Data
 * Digunakan untuk menampilkan ringkasan total di dashboard.
 */
exports.getSummary = (req, res) => {
  try {
    const totalSales =
      db.prepare("SELECT SUM(salesAmount) AS total FROM sales").get()?.total || 0;
    const totalProfit =
      db.prepare("SELECT SUM(profitAmount) AS total FROM sales").get()?.total || 0;
    const totalRegistrants =
      db.prepare("SELECT COUNT(*) AS total FROM tours").get()?.total || 0;
    const totalPax =
      db.prepare("SELECT SUM(paxCount) AS total FROM tours").get()?.total || 0;

    res.json({
      success: true,
      data: {
        totalSales,
        totalProfit,
        totalRegistrants,
        totalPax,
      },
    });
  } catch (err) {
    logger.error("❌ dashboard.getSummary failed: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 📈 Get Charts Data
 * Grafik per staff dan per region.
 */
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

    res.json({ success: true, data: { staffRows, regionRows } });
  } catch (err) {
    logger.error("❌ dashboard.getCharts failed: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🗓️ Get Sales Overview
 * Mengambil data penjualan harian 14 hari terakhir.
 */
exports.getSalesOverview = (req, res) => {
  try {
    const rows = db
      .prepare(`
        SELECT DATE(transactionDate) AS date,
               SUM(salesAmount) AS totalSales,
               SUM(profitAmount) AS totalProfit
        FROM sales
        GROUP BY DATE(transactionDate)
        ORDER BY date DESC
        LIMIT 14
      `)
      .all();

    res.json({ success: true, data: rows });
  } catch (err) {
    logger.error("❌ dashboard.getSalesOverview failed: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 📤 Export Report
 * Placeholder sementara — nanti bisa diekspor ke CSV / Excel.
 */
exports.exportReport = (req, res) => {
  try {
    // Contoh sederhana export JSON
    const rows = db.prepare(`
      SELECT s.id, s.transactionDate, s.invoiceNumber, s.salesAmount, s.profitAmount, s.staff, t.tourCode
      FROM sales s
      LEFT JOIN tours t ON s.tourId = t.id
      ORDER BY s.transactionDate DESC
    `).all();

    res.json({ success: true, data: rows });
  } catch (err) {
    logger.error("❌ dashboard.exportReport failed: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
