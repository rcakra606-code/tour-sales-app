// controllers/dashboardController.js
const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/**
 * GET /api/dashboard/summary
 * Mengembalikan ringkasan yang dibutuhkan oleh dashboard:
 * - totalTours
 * - totalSales (sum salesAmount)
 * - totalProfit (sum profitAmount)
 * - salesSeries: array { date, amount } last 30 days
 * - topRegions: top regions dari tours
 */
exports.summary = (req, res) => {
  try {
    // total tours
    const totalToursRow = db.prepare("SELECT COUNT(*) AS c FROM tours").get();
    const totalTours = totalToursRow ? totalToursRow.c : 0;

    // total sales and total profit
    const salesRow = db
      .prepare("SELECT IFNULL(SUM(salesAmount),0) AS totalSales, IFNULL(SUM(profitAmount),0) AS totalProfit FROM sales")
      .get();
    const totalSales = salesRow ? salesRow.totalSales : 0;
    const totalProfit = salesRow ? salesRow.totalProfit : 0;

    // salesSeries: last 30 days (by transactionDate). Ensure format YYYY-MM-DD in DB.
    const seriesRows = db
      .prepare(
        `SELECT transactionDate AS date, IFNULL(SUM(salesAmount),0) AS amount
         FROM sales
         WHERE transactionDate >= date('now', '-29 days')
         GROUP BY transactionDate
         ORDER BY transactionDate ASC`
      )
      .all();

    // Normalize to ensure every day in last 30 days present (0 if none)
    const salesSeries = [];
    const dayMap = {};
    seriesRows.forEach(r => {
      dayMap[r.date] = Number(r.amount || 0);
    });
    // build 30 days list
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = db.prepare("SELECT date('now', ? || ' days') AS dt").get(-i);
      // above query returns {dt: 'YYYY-MM-DD'}
      const dateStr = d.dt;
      days.push(dateStr);
    }
    days.forEach(dt => {
      salesSeries.push({ date: dt, amount: dayMap[dt] || 0 });
    });

    // top regions (from tours)
    const topRegions = db
      .prepare(
        `SELECT region, COUNT(*) AS total
         FROM tours
         WHERE region IS NOT NULL AND region != ''
         GROUP BY region
         ORDER BY total DESC
         LIMIT 6`
      )
      .all();

    // send response
    res.json({
      totalTours,
      totalSales,
      totalProfit,
      salesSeries,
      topRegions
    });
  } catch (err) {
    console.error("dashboard summary error:", err && err.message ? err.message : err);
    res.status(500).json({ error: "Gagal mengambil ringkasan dashboard." });
  }
};
