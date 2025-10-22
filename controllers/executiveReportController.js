// ==========================================================
// 🧠 Executive Dashboard Controller — Travel Dashboard Enterprise v5.4.5
// ==========================================================
// Fitur:
// - Menampilkan ringkasan penjualan, profit, dan target per staff
// - Data untuk dashboard eksekutif (grafik & insight bulanan)
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/executive/summary — Ringkasan utama
// ==========================================================
export async function getExecutiveSummary(req, res) {
  try {
    const q = `
      SELECT
        s.staff_name,
        COALESCE(SUM(s.sales_amount), 0) AS total_sales,
        COALESCE(SUM(s.profit_amount), 0) AS total_profit,
        COALESCE(t.target_sales, 0) AS target_sales,
        COALESCE(t.target_profit, 0) AS target_profit,
        CASE 
          WHEN t.target_sales > 0 THEN ROUND((SUM(s.sales_amount) / t.target_sales) * 100, 2)
          ELSE 0
        END AS sales_achievement,
        CASE 
          WHEN t.target_profit > 0 THEN ROUND((SUM(s.profit_amount) / t.target_profit) * 100, 2)
          ELSE 0
        END AS profit_achievement
      FROM sales s
      LEFT JOIN targets t 
        ON LOWER(s.staff_name) = LOWER(t.staff_name)
      GROUP BY s.staff_name, t.target_sales, t.target_profit
      ORDER BY s.staff_name ASC;
    `;

    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ Executive summary error:", err);
    res.status(500).json({ message: "Gagal memuat ringkasan eksekutif" });
  }
}

// ==========================================================
// 🔹 GET /api/executive/monthly-performance — Performa bulanan
// ==========================================================
export async function getMonthlyPerformance(req, res) {
  try {
    const q = `
      SELECT 
        DATE_TRUNC('month', transaction_date) AS month,
        COALESCE(SUM(sales_amount), 0) AS total_sales,
        COALESCE(SUM(profit_amount), 0) AS total_profit
      FROM sales
      GROUP BY DATE_TRUNC('month', transaction_date)
      ORDER BY month ASC;
    `;

    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ Monthly performance error:", err);
    res.status(500).json({ message: "Gagal memuat data performa bulanan" });
  }
}

// ==========================================================
// 🔹 GET /api/executive/tour-statistics — Statistik tour
// ==========================================================
export async function getTourStatistics(req, res) {
  try {
    const q = `
      SELECT 
        region,
        COUNT(*) AS total_tours,
        SUM(sales_amount) AS total_sales,
        SUM(profit_amount) AS total_profit
      FROM tours
      GROUP BY region
      ORDER BY total_tours DESC;
    `;

    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ Tour statistics error:", err);
    res.status(500).json({ message: "Gagal memuat statistik tour" });
  }
}

// ==========================================================
// 🔹 GET /api/executive/document-summary — Statistik dokumen
// ==========================================================
export async function getDocumentStatistics(req, res) {
  try {
    const q = `
      SELECT 
        staff_name,
        COUNT(*) AS total_docs,
        DATE_TRUNC('month', received_date) AS month
      FROM documents
      GROUP BY staff_name, DATE_TRUNC('month', received_date)
      ORDER BY month DESC, staff_name ASC;
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ Document statistics error:", err);
    res.status(500).json({ message: "Gagal memuat statistik dokumen" });
  }
}