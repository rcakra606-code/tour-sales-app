// ==========================================================
// 📊 Dashboard Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import { pool } from "../server.js";

// ===== DASHBOARD SUMMARY =====
export async function getDashboardSummary(req, res) {
  try {
    const role = req.user.role;
    const staffName = req.user.staff_name;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    let whereClause = "";
    let params = [];

    if (role === "staff") {
      whereClause = "WHERE staff_name = $1";
      params = [staffName];
    }

    const tourQuery = `
      SELECT COUNT(*) AS total_tours, 
             COALESCE(SUM(sales_amount), 0) AS total_sales, 
             COALESCE(SUM(profit_amount), 0) AS total_profit 
      FROM tours ${whereClause};
    `;
    const salesQuery = `
      SELECT COUNT(*) AS total_sales_records,
             COALESCE(SUM(sales_amount), 0) AS total_sales_amount,
             COALESCE(SUM(profit_amount), 0) AS total_profit_amount
      FROM sales ${whereClause};
    `;
    const targetQuery = `
      SELECT target_sales, target_profit 
      FROM targets 
      ${role === "staff" ? "WHERE staff_name = $1" : ""}
      AND month = $2 AND year = $3
      LIMIT 1;
    `;

    const [tourRes, salesRes, targetRes] = await Promise.all([
      pool.query(tourQuery, params),
      pool.query(salesQuery, params),
      pool.query(
        role === "staff"
          ? targetQuery
          : "SELECT COALESCE(SUM(target_sales),0) AS target_sales, COALESCE(SUM(target_profit),0) AS target_profit FROM targets WHERE month=$1 AND year=$2",
        role === "staff" ? [staffName, currentMonth, currentYear] : [currentMonth, currentYear]
      ),
    ]);

    const tour = tourRes.rows[0];
    const sales = salesRes.rows[0];
    const target = targetRes.rows[0] || { target_sales: 0, target_profit: 0 };

    const totalSales = parseFloat(tour.total_sales || 0) + parseFloat(sales.total_sales_amount || 0);
    const totalProfit = parseFloat(tour.total_profit || 0) + parseFloat(sales.total_profit_amount || 0);

    const progressSales =
      target.target_sales > 0 ? (totalSales / target.target_sales) * 100 : 0;
    const progressProfit =
      target.target_profit > 0 ? (totalProfit / target.target_profit) * 100 : 0;

    res.json({
      total_tours: parseInt(tour.total_tours || 0),
      total_sales: totalSales.toFixed(2),
      total_profit: totalProfit.toFixed(2),
      target_sales: target.target_sales,
      target_profit: target.target_profit,
      progress_sales: progressSales.toFixed(2),
      progress_profit: progressProfit.toFixed(2),
    });
  } catch (err) {
    console.error("❌ Dashboard summary error:", err);
    res.status(500).json({ message: "Gagal memuat ringkasan dashboard." });
  }
}

// ===== REGION STATS (TOUR PER REGION) =====
export async function getTourRegionStats(req, res) {
  try {
    const role = req.user.role;
    const staffName = req.user.staff_name;
    const whereClause = role === "staff" ? "WHERE staff_name = $1" : "";
    const params = role === "staff" ? [staffName] : [];

    const result = await pool.query(
      `
      SELECT region, COUNT(*) AS total_tour, COALESCE(SUM(sales_amount), 0) AS total_sales
      FROM tours
      ${whereClause}
      GROUP BY region
      ORDER BY total_tour DESC
      `,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Dashboard region stats error:", err);
    res.status(500).json({ message: "Gagal memuat data tour per region." });
  }
}

// ===== MONTHLY PERFORMANCE (FOR CHART) =====
export async function getMonthlyPerformance(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(transaction_date, 'YYYY-MM') AS month,
        SUM(sales_amount) AS total_sales,
        SUM(profit_amount) AS total_profit
      FROM sales
      WHERE transaction_date IS NOT NULL
      GROUP BY 1
      ORDER BY month ASC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Monthly performance error:", err);
    res.status(500).json({ message: "Gagal memuat performa bulanan." });
  }
}