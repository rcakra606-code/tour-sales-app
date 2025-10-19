/**
 * ==========================================================
 * 📁 controllers/dashboardController.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Controller untuk menampilkan data ringkasan dashboard:
 * - Total Sales
 * - Total Profit
 * - Jumlah Tours
 * - Target Bulanan
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
 * 📊 Ambil data ringkasan dashboard
 */
export const getSummary = async (req, res) => {
  try {
    const [salesRes, profitRes, toursRes, targetsRes] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(sales_amount), 0) AS total_sales FROM sales"),
      pool.query("SELECT COALESCE(SUM(profit_amount), 0) AS total_profit FROM sales"),
      pool.query("SELECT COUNT(*) AS total_tours FROM tours"),
      pool.query("SELECT COUNT(*) AS total_targets FROM targets"),
    ]);

    const summary = {
      total_sales: parseFloat(salesRes.rows[0].total_sales),
      total_profit: parseFloat(profitRes.rows[0].total_profit),
      total_tours: parseInt(toursRes.rows[0].total_tours),
      total_targets: parseInt(targetsRes.rows[0].total_targets),
    };

    res.json(summary);
  } catch (err) {
    console.error("❌ Dashboard summary error:", err.message);
    res.status(500).json({ message: "Gagal memuat data dashboard." });
  }
};