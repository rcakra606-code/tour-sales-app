/**
 * ==========================================================
 * controllers/dashboardController.js
 * ==========================================================
 * ✅ Dashboard utama dengan data ringkasan sales, profit, pax, registrant
 * ✅ Integrasi ke tabel sales, tours, dan staff (via staff_name)
 * ✅ Menampilkan Top 3 staff berdasarkan total sales
 * ==========================================================
 */

const db = require("../config/database");
const logger = require("../config/logger");

// ===============================
// GET /api/dashboard/summary
// ===============================
exports.getDashboardSummary = async (req, res) => {
  try {
    const totals = await db.get(`
      SELECT 
        (SELECT COUNT(*) FROM tours) AS totalTours,
        (SELECT COUNT(*) FROM sales) AS totalSalesCount,
        (SELECT IFNULL(SUM(sales_amount), 0) FROM sales) AS totalSalesTours,
        (SELECT IFNULL(SUM(profit_amount), 0) FROM sales) AS totalProfitTours,
        (SELECT IFNULL(SUM(CAST(tourprice AS FLOAT)), 0) FROM tours) AS totalTourPrice,
        (SELECT IFNULL(SUM(CAST(profitamount AS FLOAT)), 0) FROM tours) AS totalProfitTours2,
        (SELECT COUNT(DISTINCT leadpassenger) FROM tours) AS totalRegistrants,
        (SELECT COUNT(DISTINCT region) FROM regions) AS totalRegions
    `);

    // Ambil total pax (jumlah semua passenger di tours)
    const paxData = await db.all(`SELECT allpassengers FROM tours`);
    let totalPax = 0;
    paxData.forEach((t) => {
      if (t.allpassengers) {
        totalPax += t.allpassengers.split(",").filter((x) => x.trim() !== "").length;
      }
    });

    // Ambil Top 3 Staff berdasarkan total sales_amount
    const topStaff = await db.all(`
      SELECT staff_name, 
             COUNT(id) AS total_transactions,
             SUM(sales_amount) AS total_sales,
             SUM(profit_amount) AS total_profit
      FROM sales
      WHERE staff_name IS NOT NULL AND TRIM(staff_name) != ''
      GROUP BY staff_name
      ORDER BY total_sales DESC
      LIMIT 3
    `);

    res.json({
      totals: {
        totalTours: totals.totalTours || 0,
        totalSalesCount: totals.totalSalesCount || 0,
        totalSalesTours: totals.totalSalesTours || 0,
        totalProfitTours: totals.totalProfitTours || 0,
        totalRegistrants: totals.totalRegistrants || 0,
        totalRegions: totals.totalRegions || 0,
        totalPax,
      },
      topStaff,
    });
  } catch (err) {
    logger.error("Error fetching dashboard summary:", err);
    res.status(500).json({ message: "Gagal memuat ringkasan dashboard" });
  }
};

// ===============================
// GET /api/dashboard/chart-data
// ===============================
exports.getChartData = async (req, res) => {
  try {
    const chartData = await db.all(`
      SELECT 
        STRFTIME('%m', transaction_date) AS month,
        SUM(sales_amount) AS total_sales,
        SUM(profit_amount) AS total_profit
      FROM sales
      WHERE transaction_date IS NOT NULL
      GROUP BY STRFTIME('%m', transaction_date)
      ORDER BY month ASC
    `);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];

    const formatted = chartData.map((row) => ({
      month: monthNames[parseInt(row.month) - 1] || row.month,
      total_sales: row.total_sales || 0,
      total_profit: row.total_profit || 0,
    }));

    res.json({ chart: formatted });
  } catch (err) {
    logger.error("Error fetching chart data:", err);
    res.status(500).json({ message: "Gagal memuat data grafik" });
  }
};

// ===============================
// GET /api/dashboard/top-staff (opsional untuk page executive)
// ===============================
exports.getTopStaff = async (req, res) => {
  try {
    const result = await db.all(`
      SELECT staff_name,
             COUNT(id) AS total_transactions,
             SUM(sales_amount) AS total_sales,
             SUM(profit_amount) AS total_profit
      FROM sales
      WHERE staff_name IS NOT NULL AND TRIM(staff_name) != ''
      GROUP BY staff_name
      ORDER BY total_sales DESC
      LIMIT 10
    `);

    res.json({ topStaff: result });
  } catch (err) {
    logger.error("Error fetching top staff:", err);
    res.status(500).json({ message: "Gagal mengambil data staff" });
  }
};
