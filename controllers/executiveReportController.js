// ==========================================================
// 📊 Executive Dashboard Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Ringkasan eksekutif (sales, profit, tours, documents per bulan)
// - Statistik bulanan seluruh staff (target vs actual)
// - Data performa untuk grafik
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/executive/summary
// ==========================================================
export async function getExecutiveSummary(req, res) {
  try {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM tours) AS total_tours,
        (SELECT COUNT(*) FROM documents) AS total_documents,
        (SELECT SUM(sales_amount) FROM sales) AS total_sales,
        (SELECT SUM(profit_amount) FROM sales) AS total_profit,
        (SELECT COUNT(*) FROM targets) AS total_targets
    `;
    const { rows } = await pool.query(query);
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Executive summary error:", err);
    res.status(500).json({ message: "Gagal memuat ringkasan eksekutif." });
  }
}

// ==========================================================
// 🔹 GET /api/executive/monthly-performance
// ==========================================================
export async function getMonthlyPerformance(req, res) {
  try {
    // Ambil data 6 bulan terakhir
    const query = `
      SELECT
        TO_CHAR(transaction_date, 'YYYY-MM') AS month,
        SUM(sales_amount) AS total_sales,
        SUM(profit_amount) AS total_profit
      FROM sales
      WHERE transaction_date >= (CURRENT_DATE - INTERVAL '6 months')
      GROUP BY TO_CHAR(transaction_date, 'YYYY-MM')
      ORDER BY month ASC;
    `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Monthly performance error:", err);
    res.status(500).json({ message: "Gagal memuat performa bulanan." });
  }
}

// ==========================================================
// 🔹 GET /api/executive/tour-statistics
// ==========================================================
export async function getTourStatistics(req, res) {
  try {
    const query = `
      SELECT
        region,
        COUNT(*) AS total_tour,
        SUM(CASE WHEN departure_status = 'CONFIRMED' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN departure_status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN departure_status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled
      FROM tours
      GROUP BY region
      ORDER BY total_tour DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Tour statistics error:", err);
    res.status(500).json({ message: "Gagal memuat data statistik tour." });
  }
}

// ==========================================================
// 🔹 GET /api/executive/document-summary
// ==========================================================
export async function getDocumentStatistics(req, res) {
  try {
    const query = `
      SELECT
        process_type,
        COUNT(*) AS total_docs,
        SUM(CASE WHEN estimated_complete >= CURRENT_DATE THEN 1 ELSE 0 END) AS active_process,
        SUM(CASE WHEN estimated_complete < CURRENT_DATE THEN 1 ELSE 0 END) AS delayed
      FROM documents
      GROUP BY process_type;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Document statistics error:", err);
    res.status(500).json({ message: "Gagal memuat data dokumen." });
  }
}

// ==========================================================
// 🔹 GET /api/executive/staff-performance
// ==========================================================
export async function getStaffPerformance(req, res) {
  try {
    const query = `
      SELECT 
        s.staff_name,
        TO_CHAR(s.transaction_date, 'YYYY-MM') AS month,
        SUM(s.sales_amount) AS total_sales,
        SUM(s.profit_amount) AS total_profit,
        COALESCE(t.target_sales, 0) AS target_sales,
        COALESCE(t.target_profit, 0) AS target_profit
      FROM sales s
      LEFT JOIN targets t
        ON LOWER(t.staff_name) = LOWER(s.staff_name)
        AND TO_CHAR(s.transaction_date, 'YYYY-MM') = t.month
      GROUP BY s.staff_name, t.target_sales, t.target_profit, month
      ORDER BY s.staff_name, month ASC;
    `;

    const { rows } = await pool.query(query);
    const formatted = rows.map(r => ({
      staff_name: r.staff_name,
      month: r.month,
      total_sales: Number(r.total_sales || 0),
      total_profit: Number(r.total_profit || 0),
      target_sales: Number(r.target_sales || 0),
      target_profit: Number(r.target_profit || 0),
      sales_progress: r.target_sales > 0 ? Math.min(100, Math.round((r.total_sales / r.target_sales) * 100)) : 0,
      profit_progress: r.target_profit > 0 ? Math.min(100, Math.round((r.total_profit / r.target_profit) * 100)) : 0,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Staff performance error:", err);
    res.status(500).json({ message: "Gagal memuat data performa staff." });
  }
}