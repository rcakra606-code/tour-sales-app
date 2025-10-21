// controllers/executiveReportController.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * GET /api/executive/monthly-performance
 * Return monthly total sales, profit, and tour counts (12 months)
 */
export async function getMonthlyPerformance(req, res) {
  try {
    const q = `
      WITH sales_summary AS (
        SELECT 
          DATE_TRUNC('month', CAST(transaction_date AS timestamp)) AS month,
          SUM(sales_amount) AS total_sales,
          SUM(profit_amount) AS total_profit
        FROM sales
        GROUP BY month
      ),
      tour_summary AS (
        SELECT 
          DATE_TRUNC('month', CAST(departure_date AS timestamp)) AS month,
          COUNT(id) AS total_tours
        FROM tours
        GROUP BY month
      )
      SELECT 
        TO_CHAR(s.month, 'YYYY-MM') AS month,
        COALESCE(s.total_sales, 0) AS sales,
        COALESCE(s.total_profit, 0) AS profit,
        COALESCE(t.total_tours, 0) AS tours
      FROM sales_summary s
      LEFT JOIN tour_summary t ON s.month = t.month
      ORDER BY month DESC
      LIMIT 12;
    `;

    const { rows } = await pool.query(q);
    res.json({
      months: rows.map((r) => r.month),
      sales: rows.map((r) => parseFloat(r.sales) || 0),
      profit: rows.map((r) => parseFloat(r.profit) || 0),
      tours: rows.map((r) => parseInt(r.tours) || 0),
    });
  } catch (err) {
    console.error("❌ Monthly performance error:", err);
    res.status(500).json({ message: "Gagal memuat performa bulanan" });
  }
}

/**
 * GET /api/executive/sales-targets
 * Return target vs actual sales per staff (latest month)
 */
export async function getSalesTargets(req, res) {
  try {
    const q = `
      SELECT 
        s.staff_name,
        COALESCE(SUM(s.sales_amount), 0) AS actual_sales,
        COALESCE(SUM(s.profit_amount), 0) AS actual_profit,
        COALESCE(t.target_sales, 0) AS target_sales,
        COALESCE(t.target_profit, 0) AS target_profit
      FROM sales s
      LEFT JOIN targets t 
        ON LOWER(s.staff_name) = LOWER(t.staff_name)
        AND DATE_TRUNC('month', CAST(s.transaction_date AS timestamp)) = DATE_TRUNC('month', CAST(t.month AS timestamp))
      GROUP BY s.staff_name, t.target_sales, t.target_profit
      ORDER BY s.staff_name ASC;
    `;

    const { rows } = await pool.query(q);
    res.json({
      staffs: rows.map((r) => r.staff_name),
      targetSales: rows.map((r) => parseFloat(r.target_sales) || 0),
      actualSales: rows.map((r) => parseFloat(r.actual_sales) || 0),
    });
  } catch (err) {
    console.error("❌ Executive sales targets error:", err);
    res.status(500).json({ message: "Gagal memuat target sales" });
  }
}

/**
 * GET /api/executive/profit-trend
 * Return profit trend (12-month line)
 */
export async function getProfitTrend(req, res) {
  try {
    const q = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', CAST(transaction_date AS timestamp)), 'YYYY-MM') AS month,
        COALESCE(SUM(profit_amount), 0) AS profit
      FROM sales
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12;
    `;

    const { rows } = await pool.query(q);
    res.json({
      months: rows.map((r) => r.month),
      profit: rows.map((r) => parseFloat(r.profit) || 0),
    });
  } catch (err) {
    console.error("❌ Profit trend error:", err);
    res.status(500).json({ message: "Gagal memuat trend profit" });
  }
}