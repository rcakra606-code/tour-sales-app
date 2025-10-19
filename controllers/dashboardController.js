/**
 * ==========================================================
 * 📁 controllers/dashboardController.js
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Dashboard summary + Tour breakdown
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

export const getSummary = async (req, res) => {
  try {
    const [salesRes, profitRes, toursRes, targetsRes, paxRes, regionRes, monthRes] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(sales_amount), 0) AS total_sales FROM sales"),
      pool.query("SELECT COALESCE(SUM(profit_amount), 0) AS total_profit FROM sales"),
      pool.query("SELECT COUNT(*) AS total_tours FROM tours"),
      pool.query("SELECT COUNT(*) AS total_targets FROM targets"),
      pool.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN all_passengers <> '' THEN array_length(string_to_array(all_passengers, ','),1) ELSE 0 END), 0)
          + COUNT(DISTINCT lead_passenger) AS total_pax
        FROM tours;
      `),
      pool.query(`
        SELECT region, 
               COUNT(*) AS tour_count,
               COALESCE(SUM(CASE WHEN all_passengers <> '' THEN array_length(string_to_array(all_passengers, ','),1) ELSE 0 END), 0)
               + COUNT(DISTINCT lead_passenger) AS pax_count
        FROM tours
        WHERE region IS NOT NULL AND TRIM(region) <> ''
        GROUP BY region
        ORDER BY pax_count DESC;
      `),
      pool.query(`
        SELECT 
          EXTRACT(YEAR FROM departure_date)::INT AS year,
          EXTRACT(MONTH FROM departure_date)::INT AS month,
          COUNT(*) AS tour_count,
          COALESCE(SUM(CASE WHEN all_passengers <> '' THEN array_length(string_to_array(all_passengers, ','),1) ELSE 0 END), 0)
          + COUNT(DISTINCT lead_passenger) AS pax_count
        FROM tours
        WHERE departure_date IS NOT NULL
        GROUP BY year, month
        ORDER BY year DESC, month DESC;
      `)
    ]);

    const summary = {
      total_sales: parseFloat(salesRes.rows[0].total_sales),
      total_profit: parseFloat(profitRes.rows[0].total_profit),
      total_tours: parseInt(toursRes.rows[0].total_tours),
      total_targets: parseInt(targetsRes.rows[0].total_targets),
      total_pax: parseInt(paxRes.rows[0].total_pax),
      region_breakdown: regionRes.rows,
      month_breakdown: monthRes.rows
    };

    res.json(summary);
  } catch (err) {
    console.error("❌ Dashboard summary error:", err.message);
    res.status(500).json({ message: "Gagal memuat data dashboard." });
  }
};