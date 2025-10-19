/**
 * ==========================================================
 * 📁 controllers/reportSalesController.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Controller untuk modul Laporan Sales (Analitik):
 * - Rekap total sales & profit per bulan
 * - Perbandingan dengan target per staff
 * - Filter berdasarkan bulan, tahun, dan staff
 * ==========================================================
 */

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * 📊 Ambil ringkasan laporan sales bulanan
 */
export const getSalesSummary = async (req, res) => {
  try {
    const { month, year, staff_name } = req.query;

    const queryParams = [];
    let filter = "";

    if (month) {
      queryParams.push(month);
      filter += ` AND EXTRACT(MONTH FROM s.transaction_date) = $${queryParams.length}`;
    }

    if (year) {
      queryParams.push(year);
      filter += ` AND EXTRACT(YEAR FROM s.transaction_date) = $${queryParams.length}`;
    }

    if (staff_name) {
      queryParams.push(staff_name);
      filter += ` AND s.staff_name = $${queryParams.length}`;
    }

    const query = `
      SELECT 
        COALESCE(SUM(s.sales_amount), 0) AS total_sales,
        COALESCE(SUM(s.profit_amount), 0) AS total_profit,
        COUNT(s.id) AS total_transactions,
        COALESCE(t.target_sales, 0) AS target_sales,
        COALESCE(t.target_profit, 0) AS target_profit,
        (COALESCE(SUM(s.sales_amount), 0) - COALESCE(t.target_sales, 0)) AS variance_sales,
        (COALESCE(SUM(s.profit_amount), 0) - COALESCE(t.target_profit, 0)) AS variance_profit
      FROM sales s
      LEFT JOIN targets t
        ON t.staff_name = s.staff_name
       AND EXTRACT(MONTH FROM s.transaction_date) = t.month
       AND EXTRACT(YEAR FROM s.transaction_date) = t.year
      WHERE 1=1
      ${filter};
    `;

    const result = await pool.query(query, queryParams);

    const summary = result.rows[0] || {
      total_sales: 0,
      total_profit: 0,
      total_transactions: 0,
      target_sales: 0,
      target_profit: 0,
      variance_sales: 0,
      variance_profit: 0,
    };

    res.json({
      month: month ? parseInt(month) : null,
      year: year ? parseInt(year) : null,
      staff_name: staff_name || "ALL",
      ...summary,
    });
  } catch (err) {
    console.error("❌ Gagal memuat laporan sales summary:", err.message);
    res.status(500).json({ message: "Gagal memuat laporan sales summary." });
  }
};

/**
 * 📈 Ambil kinerja seluruh staff (perbandingan target vs realisasi)
 */
export const getPerformanceByStaff = async (req, res) => {
  try {
    const { month, year } = req.query;
    const queryParams = [];
    let filter = "";

    if (month) {
      queryParams.push(month);
      filter += ` AND EXTRACT(MONTH FROM s.transaction_date) = $${queryParams.length}`;
    }
    if (year) {
      queryParams.push(year);
      filter += ` AND EXTRACT(YEAR FROM s.transaction_date) = $${queryParams.length}`;
    }

    const query = `
      SELECT 
        s.staff_name,
        COALESCE(SUM(s.sales_amount), 0) AS total_sales,
        COALESCE(SUM(s.profit_amount), 0) AS total_profit,
        COALESCE(t.target_sales, 0) AS target_sales,
        COALESCE(t.target_profit, 0) AS target_profit,
        (COALESCE(SUM(s.sales_amount), 0) - COALESCE(t.target_sales, 0)) AS variance_sales,
        (COALESCE(SUM(s.profit_amount), 0) - COALESCE(t.target_profit, 0)) AS variance_profit
      FROM sales s
      LEFT JOIN targets t
        ON t.staff_name = s.staff_name
       AND EXTRACT(MONTH FROM s.transaction_date) = t.month
       AND EXTRACT(YEAR FROM s.transaction_date) = t.year
      WHERE 1=1
      ${filter}
      GROUP BY s.staff_name, t.target_sales, t.target_profit
      ORDER BY total_sales DESC;
    `;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Gagal memuat data kinerja staff:", err.message);
    res.status(500).json({ message: "Gagal memuat data kinerja staff." });
  }
};