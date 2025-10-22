// ==========================================================
// 📊 Report Tour Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================
// Fitur:
// - Rekap data tour berdasarkan region, bulan, dan status
// - Hitung total pax, sales, profit per region
// - API untuk dashboard & export laporan
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/report/tours/summary — Ringkasan Dashboard
// ==========================================================
export async function getTourSummary(req, res) {
  try {
    const { month, region } = req.query;
    let filters = [];
    let values = [];
    let i = 1;

    if (month) {
      filters.push(`TO_CHAR(departure_date, 'YYYY-MM') = $${i++}`);
      values.push(month);
    }
    if (region) {
      filters.push(`LOWER(region) = LOWER($${i++})`);
      values.push(region);
    }

    const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";

    const query = `
      SELECT
        COUNT(*) AS total_tours,
        COALESCE(SUM(tour_price), 0) AS total_revenue,
        COALESCE(SUM(sales_amount), 0) AS total_sales,
        COALESCE(SUM(profit_amount), 0) AS total_profit,
        COALESCE(SUM(
          CASE
            WHEN all_passengers IS NOT NULL AND LENGTH(all_passengers) > 0
            THEN array_length(string_to_array(all_passengers, ','), 1)
            ELSE 0
          END
        ), 0) AS total_pax
      FROM tours
      ${whereClause};
    `;

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Report tour summary error:", err);
    res.status(500).json({ message: "Gagal memuat ringkasan laporan tour." });
  }
}

// ==========================================================
// 🔹 GET /api/report/tours/region — Rekap Per Region
// ==========================================================
export async function getTourByRegion(req, res) {
  try {
    const { month } = req.query;
    let whereClause = "";
    let values = [];

    if (month) {
      whereClause = "WHERE TO_CHAR(departure_date, 'YYYY-MM') = $1";
      values.push(month);
    }

    const query = `
      SELECT
        region,
        COUNT(*) AS total_tours,
        COALESCE(SUM(tour_price), 0) AS total_revenue,
        COALESCE(SUM(sales_amount), 0) AS total_sales,
        COALESCE(SUM(profit_amount), 0) AS total_profit,
        COALESCE(SUM(
          CASE
            WHEN all_passengers IS NOT NULL AND LENGTH(all_passengers) > 0
            THEN array_length(string_to_array(all_passengers, ','), 1)
            ELSE 0
          END
        ), 0) AS total_pax
      FROM tours
      GROUP BY region
      ORDER BY total_tours DESC;
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Report tour by region error:", err);
    res.status(500).json({ message: "Gagal memuat data rekap per region." });
  }
}

// ==========================================================
// 🔹 GET /api/report/tours/status — Rekap Berdasarkan Status
// ==========================================================
export async function getTourByStatus(req, res) {
  try {
    const query = `
      SELECT
        departure_status,
        COUNT(*) AS total_tours,
        COALESCE(SUM(tour_price), 0) AS total_revenue
      FROM tours
      GROUP BY departure_status
      ORDER BY departure_status;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Report tour by status error:", err);
    res.status(500).json({ message: "Gagal memuat data rekap status tour." });
  }
}

// ==========================================================
// 🔹 GET /api/report/tours/detail — Detail Semua Tour (Export)
// ==========================================================
export async function getTourDetails(req, res) {
  try {
    const { month, region, status } = req.query;
    let filters = [];
    let values = [];
    let i = 1;

    if (month) {
      filters.push(`TO_CHAR(departure_date, 'YYYY-MM') = $${i++}`);
      values.push(month);
    }
    if (region) {
      filters.push(`LOWER(region) = LOWER($${i++})`);
      values.push(region);
    }
    if (status) {
      filters.push(`LOWER(departure_status) = LOWER($${i++})`);
      values.push(status);
    }

    const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";

    const query = `
      SELECT
        id,
        registration_date,
        lead_passenger,
        all_passengers,
        tour_code,
        region,
        departure_date,
        booking_code,
        tour_price,
        sales_amount,
        profit_amount,
        departure_status,
        staff,
        created_at
      FROM tours
      ${whereClause}
      ORDER BY departure_date DESC;
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Report tour details error:", err);
    res.status(500).json({ message: "Gagal memuat data tour." });
  }
}