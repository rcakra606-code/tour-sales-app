// ==========================================================
// 📊 Travel Dashboard Enterprise v5.1
// Dashboard Routes (KPI, Trends, Region Summary)
// ==========================================================

import express from "express";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// Helper
// ==========================================================
const safeNumber = (v) => (isNaN(v) || v === null ? 0 : Number(v));

// ==========================================================
// 1️⃣ Dashboard Summary
// ==========================================================
router.get("/summary", async (req, res) => {
  try {
    const salesQuery = await pool.query("SELECT COALESCE(SUM(sales_amount),0) AS total_sales, COALESCE(SUM(profit_amount),0) AS total_profit FROM sales");
    const tourQuery = await pool.query("SELECT COUNT(*) AS total_tours, COALESCE(SUM(CASE WHEN all_passengers != '' THEN array_length(string_to_array(all_passengers, ','),1) ELSE 0 END),0) AS total_pax FROM tours");
    const targetQuery = await pool.query("SELECT COALESCE(SUM(target_sales),0) AS target_sales, COALESCE(SUM(target_profit),0) AS target_profit FROM targets");

    const totalSales = safeNumber(salesQuery.rows[0].total_sales);
    const totalProfit = safeNumber(salesQuery.rows[0].total_profit);
    const totalTours = safeNumber(tourQuery.rows[0].total_tours);
    const totalPax = safeNumber(tourQuery.rows[0].total_pax);
    const totalTargetSales = safeNumber(targetQuery.rows[0].target_sales);
    const totalTargetProfit = safeNumber(targetQuery.rows[0].target_profit);

    const targetAchieved =
      totalTargetSales > 0
        ? Math.round((totalSales / totalTargetSales) * 100)
        : 0;

    res.json({
      totalSales,
      totalProfit,
      totalTours,
      totalPax,
      targetAchieved,
    });
  } catch (err) {
    console.error("❌ Dashboard summary error:", err.message);
    res.status(500).json({ message: "Gagal memuat data summary" });
  }
});

// ==========================================================
// 2️⃣ Sales & Profit Trend (12 bulan terakhir)
// ==========================================================
router.get("/sales-profit-trend", async (req, res) => {
  try {
    const query = `
      SELECT TO_CHAR(transaction_date, 'Mon YYYY') AS bulan,
             SUM(sales_amount) AS total_sales,
             SUM(profit_amount) AS total_profit
      FROM sales
      WHERE transaction_date >= NOW() - INTERVAL '12 months'
      GROUP BY 1
      ORDER BY MIN(transaction_date);
    `;
    const result = await pool.query(query);

    res.json({
      labels: result.rows.map((r) => r.bulan),
      sales: result.rows.map((r) => Number(r.total_sales)),
      profit: result.rows.map((r) => Number(r.total_profit)),
    });
  } catch (err) {
    console.error("❌ Trend chart error:", err.message);
    res.status(500).json({ message: "Gagal memuat data tren" });
  }
});

// ==========================================================
// 3️⃣ Tour Distribution by Region
// ==========================================================
router.get("/tour-region", async (req, res) => {
  try {
    const query = `
      SELECT region, COUNT(*) AS total_tour,
             COALESCE(SUM(CASE WHEN all_passengers != '' THEN array_length(string_to_array(all_passengers, ','),1) ELSE 0 END),0) AS total_pax
      FROM tours
      WHERE region IS NOT NULL AND region != ''
      GROUP BY region
      ORDER BY total_tour DESC;
    `;
    const result = await pool.query(query);

    res.json({
      labels: result.rows.map((r) => r.region),
      counts: result.rows.map((r) => Number(r.total_tour)),
      pax: result.rows.map((r) => Number(r.total_pax)),
    });
  } catch (err) {
    console.error("❌ Tour region error:", err.message);
    res.status(500).json({ message: "Gagal memuat data region tour" });
  }
});

export default router;