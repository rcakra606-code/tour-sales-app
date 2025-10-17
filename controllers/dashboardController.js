// controllers/dashboardController.js
const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/**
 * GET /api/dashboard/summary
 * Ringkasan utama dashboard
 */
exports.summary = (req, res) => {
  try {
    const totalTours = db.prepare("SELECT COUNT(*) AS c FROM tours").get().c || 0;

    const salesRow = db
      .prepare(
        "SELECT IFNULL(SUM(salesAmount),0) AS totalSales, IFNULL(SUM(profitAmount),0) AS totalProfit FROM sales"
      )
      .get();

    const totalSales = salesRow.totalSales || 0;
    const totalProfit = salesRow.totalProfit || 0;

    // 30 hari terakhir
    const salesData = db
      .prepare(
        `SELECT transactionDate AS date, IFNULL(SUM(salesAmount),0) AS amount
         FROM sales
         WHERE transactionDate >= date('now', '-29 days')
         GROUP BY transactionDate
         ORDER BY transactionDate ASC`
      )
      .all();

    const salesSeries = [];
    const dayMap = {};
    salesData.forEach((r) => (dayMap[r.date] = Number(r.amount || 0)));
    for (let i = 29; i >= 0; i--) {
      const d = db.prepare("SELECT date('now', ? || ' days') AS dt").get(-i);
      const dateStr = d.dt;
      salesSeries.push({ date: dateStr, amount: dayMap[dateStr] || 0 });
    }

    // region top tours
    const topRegions = db
      .prepare(
        `SELECT region, COUNT(*) AS total 
         FROM tours WHERE region != '' 
         GROUP BY region 
         ORDER BY total DESC 
         LIMIT 6`
      )
      .all();

    res.json({ totalTours, totalSales, totalProfit, salesSeries, topRegions });
  } catch (err) {
    console.error("Dashboard summary error:", err.message);
    res.status(500).json({ error: "Gagal mengambil ringkasan dashboard." });
  }
};

/**
 * GET /api/dashboard/detailed
 * Detail statistik tambahan untuk insight dashboard:
 * - per staff
 * - per region (revenue)
 * - tours per month (registrationDate)
 */
exports.detailed = (req, res) => {
  try {
    // total penjualan per staff
    const staffStats = db
      .prepare(
        `SELECT staff, SUM(salesAmount) AS totalSales, SUM(profitAmount) AS totalProfit
         FROM sales 
         WHERE staff IS NOT NULL AND staff != ''
         GROUP BY staff 
         ORDER BY totalSales DESC`
      )
      .all();

    // total revenue per region
    const regionRevenue = db
      .prepare(
        `SELECT region, SUM(tourPrice) AS totalValue, COUNT(*) AS count
         FROM tours 
         WHERE region IS NOT NULL AND region != ''
         GROUP BY region 
         ORDER BY totalValue DESC`
      )
      .all();

    // jumlah tour per bulan
    const tourMonth = db
      .prepare(
        `SELECT SUBSTR(registrationDate, 1, 7) AS month, COUNT(*) AS total
         FROM tours
         WHERE registrationDate IS NOT NULL AND registrationDate != ''
         GROUP BY month
         ORDER BY month ASC`
      )
      .all();

    res.json({ staffStats, regionRevenue, tourMonth });
  } catch (err) {
    console.error("Dashboard detailed error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data detail dashboard." });
  }
};
