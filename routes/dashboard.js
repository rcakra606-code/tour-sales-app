/**
 * ==========================================================
 * routes/dashboard.js — Travel Dashboard Enterprise v3.3
 * ==========================================================
 * Endpoint untuk ringkasan dashboard & data recent
 * - /api/dashboard/summary  -> totals & aggregates (mengutamakan data dari tours)
 * - /api/dashboard/recent   -> recent tours & recent sales (limit 5)
 *
 * Notes:
 * - Protected by auth middleware (user must be logged in)
 * - Uses getDB() (better-sqlite3) with safe prepared queries
 * - totalPax computed from 'pax_count' if column exists, otherwise from 'allPassengers'
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const { getDB } = require("../db");
const auth = require("../middleware/auth");

// Apply auth to all dashboard routes
router.use(auth);

/**
 * Utility: check if column exists in a table
 */
function columnExists(db, tableName, columnName) {
  try {
    const cols = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return cols.some(c => c.name === columnName);
  } catch (err) {
    return false;
  }
}

/**
 * GET /api/dashboard/summary
 * Returns aggregate numbers used in the dashboard summary cards
 */
router.get("/summary", (req, res) => {
  try {
    const db = getDB();

    // 1) Totals from tours table (sales & profit are aggregates per tour)
    const toursTotals = db.prepare(`
      SELECT
        IFNULL(SUM(salesAmount), 0) AS totalSalesTours,
        IFNULL(SUM(profitAmount), 0) AS totalProfitTours,
        COUNT(*) AS totalRegistrants -- number of tour entries
      FROM tours
    `).get();

    // 2) totalPax: try pax_count column first, otherwise derive from allPassengers
    let totalPax = 0;
    if (columnExists(db, "tours", "pax_count")) {
      const row = db.prepare("SELECT IFNULL(SUM(pax_count), 0) AS paxSum FROM tours").get();
      totalPax = row ? Number(row.paxSum) : 0;
    } else {
      // derive from allPassengers by counting commas +1 per non-empty field
      const allRows = db.prepare("SELECT allPassengers FROM tours WHERE IFNULL(allPassengers,'') != ''").all();
      totalPax = allRows.reduce((acc, r) => {
        try {
          const text = (r.allPassengers || "").trim();
          if (!text) return acc;
          // split by comma or newline; filter empties
          const parts = text.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
          return acc + parts.length;
        } catch (err) {
          return acc;
        }
      }, 0);
    }

    // 3) Totals from sales table (optional extra insight)
    const salesTotals = db.prepare(`
      SELECT IFNULL(SUM(sales_amount), 0) AS totalSalesTransactions,
             IFNULL(SUM(profit_amount), 0) AS totalProfitTransactions,
             COUNT(*) AS salesCount
      FROM sales
    `).get();

    // Build response
    const payload = {
      ok: true,
      totals: {
        // primary dashboard metrics (tours-based as requested)
        totalSalesTours: Number(toursTotals.totalSalesTours) || 0,
        totalProfitTours: Number(toursTotals.totalProfitTours) || 0,
        totalRegistrants: Number(toursTotals.totalRegistrants) || 0,
        totalPax: Number(totalPax) || 0,

        // additional financial insight from sales (invoice-level)
        totalSalesTransactions: Number(salesTotals.totalSalesTransactions) || 0,
        totalProfitTransactions: Number(salesTotals.totalProfitTransactions) || 0,
        salesTransactionCount: Number(salesTotals.salesCount) || 0
      },
      timestamp: new Date()
    };

    res.json(payload);
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ ok: false, error: "Gagal memuat ringkasan dashboard" });
  }
});

/**
 * GET /api/dashboard/recent
 * Returns recent tours and recent sales (limit 5 each)
 */
router.get("/recent", (req, res) => {
  try {
    const db = getDB();

    const recentTours = db.prepare(`
      SELECT id, registrationDate, leadPassenger, allPassengers, tourCode, region,
             departureDate, salesAmount, profitAmount, departureStatus, created_at
      FROM tours
      ORDER BY id DESC
      LIMIT 5
    `).all();

    const recentSales = db.prepare(`
      SELECT id, transaction_date AS transactionDate, invoice_number AS invoiceNumber,
             sales_amount AS salesAmount, profit_amount AS profitAmount, discount_amount AS discountAmount,
             staff_username AS staff, created_at
      FROM sales
      ORDER BY id DESC
      LIMIT 5
    `).all();

    res.json({ ok: true, recentTours, recentSales, timestamp: new Date() });
  } catch (err) {
    console.error("Dashboard recent error:", err);
    res.status(500).json({ ok: false, error: "Gagal memuat data recent" });
  }
});

module.exports = router;
