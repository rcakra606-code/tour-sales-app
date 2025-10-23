// ==========================================================
// 📊 Dashboard Controller — Travel Dashboard Enterprise v5.4.9
// ==========================================================

import { pool } from "../server.js";

// ===== DASHBOARD SUMMARY =====
export async function getDashboardSummary(req, res) {
  try {
    const user = req.user;
    const role = user.role;
    const staffName = user.staff_name;

    // Filter untuk staff hanya tampilkan datanya sendiri
    const whereClause = role === "staff" ? `WHERE staff_name = '${staffName}'` : "";

    const salesRes = await pool.query(
      `SELECT COALESCE(SUM(sales_amount),0) AS total_sales,
              COALESCE(SUM(profit_amount),0) AS total_profit
       FROM sales ${whereClause}`
    );

    const tourRes = await pool.query(
      `SELECT COUNT(*) AS total_tours,
              COALESCE(SUM(sales_amount),0) AS tour_sales,
              COALESCE(SUM(profit_amount),0) AS tour_profit
       FROM tours ${whereClause}`
    );

    const docRes = await pool.query(
      `SELECT COUNT(*) AS total_docs FROM documents ${whereClause}`
    );

    const regionRes = await pool.query(
      `SELECT region, COUNT(*) AS pax_count
       FROM tours ${whereClause ? whereClause + " AND" : "WHERE"} region IS NOT NULL
       GROUP BY region ORDER BY pax_count DESC`
    );

    const targetRes = await pool.query(
      `SELECT COALESCE(SUM(target_sales),0) AS target_sales,
              COALESCE(SUM(target_profit),0) AS target_profit
       FROM targets ${whereClause}`
    );

    res.json({
      user: staffName,
      role,
      total_sales: Number(salesRes.rows[0].total_sales),
      total_profit: Number(salesRes.rows[0].total_profit),
      total_tours: Number(tourRes.rows[0].total_tours),
      total_docs: Number(docRes.rows[0].total_docs),
      pax_region: regionRes.rows,
      target_sales: Number(targetRes.rows[0].target_sales),
      target_profit: Number(targetRes.rows[0].target_profit)
    });
  } catch (err) {
    console.error("❌ Dashboard summary error:", err);
    res.status(500).json({ message: "Gagal memuat ringkasan dashboard." });
  }
}

// ===== DASHBOARD REGION SUMMARY =====
export async function getTourRegionStats(req, res) {
  try {
    const result = await pool.query(`
      SELECT region, COUNT(*) AS pax_count, SUM(sales_amount) AS total_sales
      FROM tours WHERE region IS NOT NULL
      GROUP BY region ORDER BY pax_count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Dashboard region error:", err);
    res.status(500).json({ message: "Gagal memuat data region." });
  }
}