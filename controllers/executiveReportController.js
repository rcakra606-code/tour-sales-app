/**
 * ==========================================================
 * 📁 controllers/executiveReportController.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Controller untuk laporan eksekutif:
 * - Menggabungkan data dari sales, tours, dan documents
 * - Ringkasan performa perusahaan per bulan / tahun
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
 * 📊 Ambil laporan eksekutif lengkap (summary lintas modul)
 */
export const getExecutiveSummary = async (req, res) => {
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

    // Query gabungan untuk laporan lintas modul
    const query = `
      WITH sales_summary AS (
        SELECT 
          COALESCE(SUM(s.sales_amount), 0) AS total_sales,
          COALESCE(SUM(s.profit_amount), 0) AS total_profit
        FROM sales s
        WHERE 1=1 ${filter}
      ),
      tour_summary AS (
        SELECT COUNT(*) AS total_tours
        FROM tours
        WHERE 1=1
        ${month ? `AND EXTRACT(MONTH FROM departure_date) = ${month}` : ""}
        ${year ? `AND EXTRACT(YEAR FROM departure_date) = ${year}` : ""}
      ),
      document_summary AS (
        SELECT COUNT(*) AS total_documents
        FROM documents
        WHERE 1=1
        ${month ? `AND EXTRACT(MONTH FROM received_date) = ${month}` : ""}
        ${year ? `AND EXTRACT(YEAR FROM received_date) = ${year}` : ""}
      )
      SELECT 
        ss.total_sales,
        ss.total_profit,
        ts.total_tours,
        ds.total_documents,
        ROUND(
          CASE WHEN ts.total_tours > 0 
          THEN ss.total_sales / ts.total_tours ELSE 0 END, 2
        ) AS avg_sales_per_tour,
        ROUND(
          CASE WHEN ts.total_tours > 0 
          THEN ss.total_profit / ts.total_tours ELSE 0 END, 2
        ) AS avg_profit_per_tour
      FROM sales_summary ss, tour_summary ts, document_summary ds;
    `;

    const result = await pool.query(query, queryParams);

    res.json({
      month: month ? parseInt(month) : null,
      year: year ? parseInt(year) : null,
      ...result.rows[0],
    });
  } catch (err) {
    console.error("❌ Gagal memuat laporan eksekutif:", err.message);
    res.status(500).json({ message: "Gagal memuat laporan eksekutif." });
  }
};