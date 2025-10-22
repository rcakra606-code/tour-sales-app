// ==========================================================
// 📊 Executive Report Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Ringkasan global (Sales, Profit, Tours, Targets)
// - Rekap per staff, region, dan bulan
// - Data untuk grafik performance di executive dashboard
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/executive/overview — Ringkasan Umum
// ==========================================================
export async function getOverview(req, res) {
  try {
    const { month } = req.query;

    const query = `
      WITH 
      sales_summary AS (
        SELECT 
          COUNT(*) AS total_sales,
          COALESCE(SUM(sales_amount), 0) AS total_sales_amount,
          COALESCE(SUM(profit_amount), 0) AS total_profit
        FROM sales
        ${month ? "WHERE TO_CHAR(transaction_date, 'YYYY-MM') = $1" : ""}
      ),
      tour_summary AS (
        SELECT 
          COUNT(*) AS total_tours,
          COALESCE(SUM(tour_price), 0) AS total_revenue,
          COALESCE(SUM(sales_amount), 0) AS total_tour_sales,
          COALESCE(SUM(profit_amount), 0) AS total_tour_profit
        FROM tours
        ${month ? "WHERE TO_CHAR(departure_date, 'YYYY-MM') = $1" : ""}
      ),
      target_summary AS (
        SELECT 
          COALESCE(SUM(target_sales), 0) AS total_target_sales,
          COALESCE(SUM(target_profit), 0) AS total_target_profit
        FROM targets
        ${month ? "WHERE month = $1" : ""}
      )
      SELECT
        s.total_sales,
        s.total_sales_amount,
        s.total_profit,
        t.total_tours,
        t.total_revenue,
        t.total_tour_sales,
        t.total_tour_profit,
        g.total_target_sales,
        g.total_target_profit
      FROM sales_summary s, tour_summary t, target_summary g;
    `;

    const result = await pool.query(query, month ? [month] : []);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Executive overview error:", err);
    res.status(500).json({ message: "Gagal memuat data ringkasan eksekutif." });
  }
}

// ==========================================================
// 🔹 GET /api/executive/performance — Kinerja Staff (Sales vs Target)
// ==========================================================
export async function getStaffPerformance(req, res) {
  try {
    const { month } = req.query;

    const query = `
      SELECT 
        t.staff_name,
        t.target_sales,
        t.target_profit,
        COALESCE(SUM(s.sales_amount), 0) AS actual_sales,
        COALESCE(SUM(s.profit_amount), 0) AS actual_profit,
        ROUND(
          CASE 
            WHEN t.target_sales > 0 
            THEN (SUM(s.sales_amount) / t.target_sales * 100)
            ELSE 0
          END, 2
        ) AS achievement_sales,
        ROUND(
          CASE 
            WHEN t.target_profit > 0 
            THEN (SUM(s.profit_amount) / t.target_profit * 100)
            ELSE 0
          END, 2
        ) AS achievement_profit
      FROM targets t
      LEFT JOIN sales s
        ON LOWER(s.staff_name) = LOWER(t.staff_name)
        AND TO_CHAR(s.transaction_date, 'YYYY-MM') = t.month
      WHERE t.month = $1
      GROUP BY t.staff_name, t.target_sales, t.target_profit
      ORDER BY t.staff_name ASC;
    `;

    const result = await pool.query(query, [month]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Staff performance error:", err);
    res.status(500).json({ message: "Gagal memuat performa staff." });
  }
}

// ==========================================================
// 🔹 GET /api/executive/region-performance — Kinerja Per Region
// ==========================================================
export async function getRegionPerformance(req, res) {
  try {
    const { month } = req.query;

    const query = `
      SELECT 
        region,
        COUNT(*) AS total_tours,
        COALESCE(SUM(tour_price), 0) AS total_revenue,
        COALESCE(SUM(sales_amount), 0) AS total_sales,
        COALESCE(SUM(profit_amount), 0) AS total_profit
      FROM tours
      ${month ? "WHERE TO_CHAR(departure_date, 'YYYY-MM') = $1" : ""}
      GROUP BY region
      ORDER BY total_sales DESC;
    `;

    const result = await pool.query(query, month ? [month] : []);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Region performance error:", err);
    res.status(500).json({ message: "Gagal memuat kinerja region." });
  }
}

// ==========================================================
// 🔹 GET /api/executive/monthly-performance — Grafik Per Bulan
// ==========================================================
export async function getMonthlyPerformance(req, res) {
  try {
    const query = `
      SELECT 
        TO_CHAR(transaction_date, 'YYYY-MM') AS bulan,
        COALESCE(SUM(sales_amount), 0) AS total_sales,
        COALESCE(SUM(profit_amount), 0) AS total_profit
      FROM sales
      GROUP BY TO_CHAR(transaction_date, 'YYYY-MM')
      ORDER BY bulan ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Monthly performance error:", err);
    res.status(500).json({ message: "Gagal memuat performa bulanan." });
  }
}