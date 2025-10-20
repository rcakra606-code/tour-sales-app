// ==========================================================
// 📈 Travel Dashboard Enterprise v5.1
// Executive Report Routes (Sales, Profit, Tour, Target KPI)
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

// Helper
const safeNumber = (v) => (isNaN(v) || v === null ? 0 : Number(v));

// ==========================================================
// 1️⃣ GET — KPI Summary (Global Executive Overview)
// ==========================================================
router.get("/summary", async (req, res) => {
  try {
    const salesQuery = await pool.query("SELECT COALESCE(SUM(sales_amount),0) AS total_sales, COALESCE(SUM(profit_amount),0) AS total_profit FROM sales");
    const toursQuery = await pool.query("SELECT COUNT(*) AS total_tours, COALESCE(SUM(CASE WHEN all_passengers != '' THEN array_length(string_to_array(all_passengers, ','),1) ELSE 0 END),0) AS total_pax FROM tours");
    const targetsQuery = await pool.query("SELECT COALESCE(SUM(target_sales),0) AS target_sales, COALESCE(SUM(target_profit),0) AS target_profit FROM targets");

    const totalSales = safeNumber(salesQuery.rows[0].total_sales);
    const totalProfit = safeNumber(salesQuery.rows[0].total_profit);
    const totalTours = safeNumber(toursQuery.rows[0].total_tours);
    const totalPax = safeNumber(toursQuery.rows[0].total_pax);
    const targetSales = safeNumber(targetsQuery.rows[0].target_sales);
    const targetProfit = safeNumber(targetsQuery.rows[0].target_profit);

    const targetAchieved =
      targetSales > 0 ? Math.round((totalSales / targetSales) * 100) : 0;

    res.json({
      totalSales,
      totalProfit,
      totalTours,
      totalPax,
      targetAchieved,
    });
  } catch (err) {
    console.error("❌ Executive summary error:", err.message);
    res.status(500).json({ message: "Gagal memuat KPI eksekutif" });
  }
});

// ==========================================================
// 2️⃣ GET — Monthly Performance (Sales, Profit, Target vs Actual)
// ==========================================================
router.get("/monthly-performance", async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(s.transaction_date, 'Mon YYYY') AS bulan,
        COALESCE(SUM(s.sales_amount),0) AS sales,
        COALESCE(SUM(s.profit_amount),0) AS profit,
        COALESCE(SUM(t.target_sales),0) AS target_sales,
        COALESCE(SUM(t.target_profit),0) AS target_profit
      FROM sales s
      LEFT JOIN targets t 
        ON DATE_TRUNC('month', s.transaction_date) = DATE_TRUNC('month', t.target_month)
      WHERE s.transaction_date >= NOW() - INTERVAL '12 months'
      GROUP BY 1
      ORDER BY MIN(s.transaction_date);
    `;

    const result = await pool.query(query);

    res.json({
      labels: result.rows.map((r) => r.bulan),
      actualSales: result.rows.map((r) => Number(r.sales)),
      targetSales: result.rows.map((r) => Number(r.target_sales)),
      actualProfit: result.rows.map((r) => Number(r.profit)),
      targetProfit: result.rows.map((r) => Number(r.target_profit)),
    });
  } catch (err) {
    console.error("❌ Monthly performance error:", err.message);
    res.status(500).json({ message: "Gagal memuat performa bulanan" });
  }
});

// ==========================================================
// 3️⃣ GET — Region Performance (Tour distribution & pax per region)
// ==========================================================
router.get("/region-performance", async (req, res) => {
  try {
    const query = `
      SELECT 
        r.name AS region_name,
        COUNT(t.id) AS total_tours,
        COALESCE(SUM(CASE WHEN t.all_passengers != '' THEN array_length(string_to_array(t.all_passengers, ','),1) ELSE 0 END),0) AS total_pax,
        COALESCE(SUM(t.profit_amount),0) AS total_profit
      FROM regions r
      LEFT JOIN tours t ON r.name = t.region
      GROUP BY r.name
      ORDER BY total_tours DESC;
    `;
    const result = await pool.query(query);

    res.json({
      regions: result.rows.map((r) => r.region_name),
      totalTours: result.rows.map((r) => Number(r.total_tours)),
      totalPax: result.rows.map((r) => Number(r.total_pax)),
      totalProfit: result.rows.map((r) => Number(r.total_profit)),
    });
  } catch (err) {
    console.error("❌ Region performance error:", err.message);
    res.status(500).json({ message: "Gagal memuat data region" });
  }
});

// ==========================================================
// 4️⃣ GET — Top Staff by Profit
// ==========================================================
router.get("/top-staff", async (req, res) => {
  try {
    const query = `
      SELECT staff_name, 
             COUNT(id) AS total_sales,
             SUM(sales_amount) AS total_sales_amount,
             SUM(profit_amount) AS total_profit
      FROM sales
      WHERE staff_name IS NOT NULL AND staff_name != ''
      GROUP BY staff_name
      ORDER BY total_profit DESC
      LIMIT 5;
    `;
    const result = await pool.query(query);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Top staff error:", err.message);
    res.status(500).json({ message: "Gagal memuat data staff terbaik" });
  }
});

export default router;