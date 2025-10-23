// ==========================================================
// 👔 Executive Report Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import { pool } from "../server.js";

// ===== PERFORMANSI STAFF (TOTAL SALES & PROFIT PER STAFF) =====
export async function getStaffPerformance(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        staff_name,
        COALESCE(SUM(sales_amount),0) AS total_sales,
        COALESCE(SUM(profit_amount),0) AS total_profit,
        COUNT(*) AS total_transactions
      FROM sales
      GROUP BY staff_name
      ORDER BY total_sales DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Staff performance error:", err);
    res.status(500).json({ message: "Gagal memuat performa staff." });
  }
}

// ===== PROGRESS TARGET =====
export async function getTargetProgress(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        t.staff_name,
        COALESCE(SUM(t.target_sales),0) AS target_sales,
        COALESCE(SUM(t.target_profit),0) AS target_profit,
        COALESCE(SUM(s.sales_amount),0) AS actual_sales,
        COALESCE(SUM(s.profit_amount),0) AS actual_profit
      FROM targets t
      LEFT JOIN sales s ON t.staff_name = s.staff_name
      GROUP BY t.staff_name
      ORDER BY t.staff_name ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Target progress error:", err);
    res.status(500).json({ message: "Gagal memuat progress target." });
  }
}

// ===== PERFORMANSI BULANAN =====
export async function getMonthlyPerformance(req, res) {
  try {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', transaction_date) AS month,
        COALESCE(SUM(sales_amount),0) AS total_sales,
        COALESCE(SUM(profit_amount),0) AS total_profit
      FROM sales
      WHERE transaction_date IS NOT NULL
      GROUP BY DATE_TRUNC('month', transaction_date)
      ORDER BY month DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Monthly performance error:", err);
    res.status(500).json({ message: "Gagal memuat performa bulanan." });
  }
}