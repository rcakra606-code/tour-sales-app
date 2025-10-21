// controllers/dashboardController.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * GET /api/dashboard/summary
 * Return main summary numbers (sales, profit, tours, regions)
 */
export async function getDashboardSummary(req, res) {
  try {
    const userRole = req.user.role;
    const staffName = req.user.staff_name || req.user.username;

    let where = "";
    if (userRole === "staff") where = `WHERE s.staff_name = '${staffName}'`;

    const totalSalesQ = `SELECT COALESCE(SUM(sales_amount),0) AS total_sales, COALESCE(SUM(profit_amount),0) AS total_profit FROM sales s ${where}`;
    const totalToursQ = `SELECT COUNT(*) AS total_tours FROM tours ${where ? `WHERE staff = '${staffName}'` : ""}`;
    const totalRegionsQ = `SELECT COUNT(*) AS total_regions FROM regions`;

    const [salesR, toursR, regionR] = await Promise.all([
      pool.query(totalSalesQ),
      pool.query(totalToursQ),
      pool.query(totalRegionsQ),
    ]);

    return res.json({
      totalSales: parseFloat(salesR.rows[0].total_sales) || 0,
      totalProfit: parseFloat(salesR.rows[0].total_profit) || 0,
      totalTours: parseInt(toursR.rows[0].total_tours) || 0,
      totalRegions: parseInt(regionR.rows[0].total_regions) || 0,
    });
  } catch (err) {
    console.error("❌ Dashboard summary error:", err);
    res.status(500).json({ message: "Gagal memuat summary" });
  }
}

/**
 * GET /api/dashboard/staff-progress
 * Return progress comparison for each staff (sales & profit)
 */
export async function getStaffProgress(req, res) {
  try {
    const role = req.user.role;
    const staffName = req.user.staff_name || req.user.username;

    let filter = "";
    if (role === "staff") filter = `WHERE s.staff_name = '${staffName}'`;

    const q = `
      SELECT 
        s.staff_name,
        DATE_TRUNC('month', s.transaction_date)::date AS month,
        COALESCE(SUM(s.sales_amount),0) AS total_sales,
        COALESCE(SUM(s.profit_amount),0) AS total_profit,
        COALESCE(t.target_sales,0) AS target_sales,
        COALESCE(t.target_profit,0) AS target_profit
      FROM sales s
      LEFT JOIN targets t 
        ON LOWER(s.staff_name) = LOWER(t.staff_name)
        AND DATE_TRUNC('month', s.transaction_date) = DATE_TRUNC('month', t.month)
      ${filter}
      GROUP BY s.staff_name, t.target_sales, t.target_profit, month
      ORDER BY month DESC
      LIMIT 12;
    `;

    const { rows } = await pool.query(q);
    return res.json(rows);
  } catch (err) {
    console.error("❌ Staff progress error:", err);
    res.status(500).json({ message: "Gagal memuat progress staff" });
  }
}

/**
 * GET /api/dashboard/tour-region
 * Return total pax per region (for chart)
 */
export async function getTourRegion(req, res) {
  try {
    const q = `
      SELECT r.name AS region, COUNT(t.id) AS total_tours
      FROM tours t
      LEFT JOIN regions r ON r.name = t.region
      GROUP BY r.name
      ORDER BY total_tours DESC;
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ GET regions error:", err);
    res.status(500).json({ message: "Gagal memuat data region" });
  }
}