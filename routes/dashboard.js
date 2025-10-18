/**
 * ==========================================================
 * routes/dashboard.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ PostgreSQL (Neon) ready
 * ✅ Summary untuk Dashboard Overview
 * ✅ Data chart (sales, profit, pax)
 * ✅ Recent Tours & Sales
 * ✅ Role-aware (super/semi/basic)
 * ==========================================================
 */

const express = require("express");
const db = require("../config/database");
const auth = require("../middleware/auth");

const router = express.Router();

// Middleware auth diaktifkan di semua endpoint
router.use(auth);

/**
 * ==========================================================
 * GET /api/dashboard/summary
 * ==========================================================
 * Mengambil data ringkasan untuk dashboard:
 * - Total Sales Tours
 * - Total Profit Tours
 * - Total Pax (jumlah peserta)
 * - Total Registrants
 * ==========================================================
 */
router.get("/summary", async (req, res) => {
  try {
    const totalSalesRes = await db.query("SELECT COALESCE(SUM(salesamount),0) AS total FROM tours");
    const totalProfitRes = await db.query("SELECT COALESCE(SUM(profitamount),0) AS total FROM tours");
    const paxRes = await db.query(`
      SELECT COALESCE(SUM(
        CASE 
          WHEN allpassengers IS NOT NULL AND LENGTH(allpassengers) > 0
          THEN array_length(string_to_array(allpassengers, ','), 1)
          ELSE 0
        END
      ),0) AS total_pax
      FROM tours;
    `);
    const registrantRes = await db.query("SELECT COUNT(*) AS total FROM tours");

    const totals = {
      totalSalesTours: Number(totalSalesRes.rows[0].total),
      totalProfitTours: Number(totalProfitRes.rows[0].total),
      totalPax: Number(paxRes.rows[0].total_pax),
      totalRegistrants: Number(registrantRes.rows[0].total),
    };

    res.json({ success: true, totals });
  } catch (err) {
    console.error("❌ Error dashboard summary:", err.message);
    res.status(500).json({ error: "Gagal mengambil ringkasan dashboard" });
  }
});

/**
 * ==========================================================
 * GET /api/dashboard/recent
 * ==========================================================
 * Mengambil 5 tour dan 5 sales terakhir
 * ==========================================================
 */
router.get("/recent", async (req, res) => {
  try {
    const toursRes = await db.query(
      "SELECT id, tourcode, leadpassenger, region, salesamount, profitamount, departurestatus, departuredate FROM tours ORDER BY id DESC LIMIT 5"
    );
    const salesRes = await db.query(
      "SELECT id, transaction_date, invoice_number, sales_amount, profit_amount, discount_amount, staff_username FROM sales ORDER BY id DESC LIMIT 5"
    );

    res.json({
      success: true,
      recentTours: toursRes.rows,
      recentSales: salesRes.rows,
    });
  } catch (err) {
    console.error("❌ Error dashboard recent:", err.message);
    res.status(500).json({ error: "Gagal mengambil data terbaru" });
  }
});

/**
 * ==========================================================
 * GET /api/dashboard/chart-data
 * ==========================================================
 * Menyediakan data untuk Chart.js di frontend
 * - Aggregasi Sales & Profit per bulan
 * ==========================================================
 */
router.get("/chart-data", async (req, res) => {
  try {
    const chartRes = await db.query(`
      SELECT
        TO_CHAR(TO_DATE(departuredate, 'YYYY-MM-DD'), 'Mon YYYY') AS month,
        COALESCE(SUM(salesamount),0) AS total_sales,
        COALESCE(SUM(profitamount),0) AS total_profit
      FROM tours
      WHERE departuredate IS NOT NULL
      GROUP BY month
      ORDER BY MIN(TO_DATE(departuredate, 'YYYY-MM-DD')) ASC
    `);

    res.json({ success: true, chart: chartRes.rows });
  } catch (err) {
    console.error("❌ Error chart data:", err.message);
    res.status(500).json({ error: "Gagal mengambil data grafik" });
  }
});

module.exports = router;
