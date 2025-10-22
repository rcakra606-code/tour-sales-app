// ==========================================================
// 💹 Report Sales Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Rekap penjualan dan profit per staff
// - Bandingkan dengan target bulanan
// - Rekap per kategori & bulan
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/report/sales/summary — Ringkasan Dashboard
// ==========================================================
export async function getSalesSummary(req, res) {
  try {
    const { month, staff } = req.query;
    let filters = [];
    let values = [];
    let i = 1;

    if (month) {
      filters.push(`TO_CHAR(transaction_date, 'YYYY-MM') = $${i++}`);
      values.push(month);
    }
    if (staff) {
      filters.push(`LOWER(staff_name) = LOWER($${i++})`);
      values.push(staff);
    }

    const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";

    const query = `
      SELECT
        COUNT(*) AS total_transactions,
        COALESCE(SUM(sales_amount), 0) AS total_sales,
        COALESCE(SUM(profit_amount), 0) AS total_profit
      FROM sales
      ${whereClause};
    `;

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Sales summary error:", err);
    res.status(500).json({ message: "Gagal memuat ringkasan penjualan." });
  }
}

// ==========================================================
// 🔹 GET /api/report/sales/staff — Rekap Per Staff (Untuk Executive Dashboard)
// ==========================================================
export async function getSalesByStaff(req, res) {
  try {
    const { month } = req.query;
    let whereClause = "";
    let values = [];

    if (month) {
      whereClause = "WHERE TO_CHAR(transaction_date, 'YYYY-MM') = $1";
      values.push(month);
    }

    const query = `
      SELECT
        staff_name,
        COUNT(*) AS total_transactions,
        COALESCE(SUM(sales_amount), 0) AS total_sales,
        COALESCE(SUM(profit_amount), 0) AS total_profit
      FROM sales
      ${whereClause}
      GROUP BY staff_name
      ORDER BY total_sales DESC;
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Sales by staff error:", err);
    res.status(500).json({ message: "Gagal memuat data per staff." });
  }
}

// ==========================================================
// 🔹 GET /api/report/sales/target — Bandingkan Target vs Aktual
// ==========================================================
export async function getSalesTargetComparison(req, res) {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "Parameter bulan wajib diisi (format YYYY-MM)." });
    }

    const query = `
      SELECT
        t.staff_name,
        t.target_sales,
        t.target_profit,
        COALESCE(SUM(s.sales_amount), 0) AS actual_sales,
        COALESCE(SUM(s.profit_amount), 0) AS actual_profit
      FROM targets t
      LEFT JOIN sales s
        ON LOWER(s.staff_name) = LOWER(t.staff_name)
        AND TO_CHAR(s.transaction_date, 'YYYY-MM') = t.month
      WHERE t.month = $1
      GROUP BY t.staff_name, t.target_sales, t.target_profit
      ORDER BY t.staff_name;
    `;

    const result = await pool.query(query, [month]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Target comparison error:", err);
    res.status(500).json({ message: "Gagal memuat data target vs aktual." });
  }
}

// ==========================================================
// 🔹 GET /api/report/sales/detail — Detail Transaksi (Untuk Export)
// ==========================================================
export async function getSalesDetail(req, res) {
  try {
    const { month, staff } = req.query;
    let filters = [];
    let values = [];
    let i = 1;

    if (month) {
      filters.push(`TO_CHAR(transaction_date, 'YYYY-MM') = $${i++}`);
      values.push(month);
    }
    if (staff) {
      filters.push(`LOWER(staff_name) = LOWER($${i++})`);
      values.push(staff);
    }

    const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";

    const query = `
      SELECT
        id,
        invoice_number,
        transaction_date,
        category,
        sales_amount,
        profit_amount,
        staff_name,
        created_at
      FROM sales
      ${whereClause}
      ORDER BY transaction_date DESC;
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Sales detail error:", err);
    res.status(500).json({ message: "Gagal memuat data penjualan." });
  }
}