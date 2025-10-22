// ==========================================================
// 📊 Dashboard Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Dashboard summary (total sales, profit, tour, dokumen, user aktif)
// - Tour region data untuk chart
// - Target vs realisasi sales/profit per bulan per staff
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/dashboard/summary
// ==========================================================
export async function getDashboardSummary(req, res) {
  try {
    // Dapatkan bulan aktif (YYYY-MM)
    const now = new Date();
    const activeMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Total sales, profit, tour, dokumen
    const totalQuery = `
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM tours) AS total_tours,
        (SELECT COUNT(*) FROM documents) AS total_documents,
        (SELECT SUM(sales_amount) FROM sales) AS total_sales,
        (SELECT SUM(profit_amount) FROM sales) AS total_profit;
    `;

    const { rows: totalRows } = await pool.query(totalQuery);
    const summary = totalRows[0];

    // Target per bulan & pencapaian aktual
    const targetQuery = `
      SELECT t.staff_name,
             t.month,
             t.target_sales,
             t.target_profit,
             COALESCE(SUM(s.sales_amount),0) AS actual_sales,
             COALESCE(SUM(s.profit_amount),0) AS actual_profit
      FROM targets t
      LEFT JOIN sales s
        ON LOWER(s.staff_name) = LOWER(t.staff_name)
        AND TO_CHAR(s.transaction_date, 'YYYY-MM') = t.month
      WHERE t.month = $1
      GROUP BY t.staff_name, t.month, t.target_sales, t.target_profit
      ORDER BY t.staff_name ASC;
    `;

    const { rows: targetRows } = await pool.query(targetQuery, [activeMonth]);

    // Format hasil target dengan persen pencapaian
    const targetData = targetRows.map((t) => ({
      staff_name: t.staff_name,
      month: t.month,
      target_sales: Number(t.target_sales || 0),
      target_profit: Number(t.target_profit || 0),
      actual_sales: Number(t.actual_sales || 0),
      actual_profit: Number(t.actual_profit || 0),
      sales_progress: t.target_sales > 0 ? Math.min(100, Math.round((t.actual_sales / t.target_sales) * 100)) : 0,
      profit_progress: t.target_profit > 0 ? Math.min(100, Math.round((t.actual_profit / t.target_profit) * 100)) : 0,
    }));

    res.json({
      totals: {
        total_users: Number(summary.total_users || 0),
        total_tours: Number(summary.total_tours || 0),
        total_documents: Number(summary.total_documents || 0),
        total_sales: Number(summary.total_sales || 0),
        total_profit: Number(summary.total_profit || 0),
      },
      targets: targetData,
      month: activeMonth,
    });
  } catch (err) {
    console.error("❌ Dashboard summary error:", err);
    res.status(500).json({ message: "Gagal memuat ringkasan dashboard." });
  }
}

// ==========================================================
// 🔹 GET /api/dashboard/tour-region
// ==========================================================
export async function getTourRegionData(req, res) {
  try {
    const query = `
      SELECT region, COUNT(*) AS total_tour, 
             SUM(CASE WHEN departure_status = 'CONFIRMED' THEN 1 ELSE 0 END) AS confirmed,
             SUM(CASE WHEN departure_status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
             SUM(CASE WHEN departure_status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled
      FROM tours
      GROUP BY region
      ORDER BY region;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Tour region summary error:", err);
    res.status(500).json({ message: "Gagal memuat data tour per region." });
  }
}