// ==========================================================
// 📊 Travel Dashboard Enterprise v5.3
// Dashboard Controller (Summary + Charts + PostgreSQL)
// ==========================================================
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 📈 Dashboard Summary (Total KPI)
export const getDashboardSummary = async (req, res) => {
  try {
    const [sales, profit, tours, pax, targets] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(sales_amount),0) AS total_sales FROM sales"),
      pool.query("SELECT COALESCE(SUM(profit_amount),0) AS total_profit FROM sales"),
      pool.query("SELECT COUNT(*) AS total_tours FROM tours"),
      pool.query("SELECT COALESCE(SUM(ARRAY_LENGTH(string_to_array(all_passengers, ','),1)),0) AS total_pax FROM tours"),
      pool.query("SELECT COALESCE(AVG(target_sales),0) AS avg_target_sales, COALESCE(AVG(target_profit),0) AS avg_target_profit FROM targets")
    ]);

    // Hitung target achieved (rata-rata pencapaian)
    const totalSales = Number(sales.rows[0].total_sales);
    const totalProfit = Number(profit.rows[0].total_profit);
    const targetSales = Number(targets.rows[0].avg_target_sales);
    const targetProfit = Number(targets.rows[0].avg_target_profit);

    const targetAchieved =
      targetSales > 0
        ? Math.round(((totalSales / targetSales) * 100 + (totalProfit / targetProfit) * 100) / 2)
        : 0;

    res.json({
      totalSales,
      totalProfit,
      totalTours: Number(tours.rows[0].total_tours),
      totalPax: Number(pax.rows[0].total_pax),
      targetAchieved
    });
  } catch (err) {
    console.error("❌ Dashboard summary error:", err.message);
    res.status(500).json({ message: "Gagal memuat data dashboard" });
  }
};

// 📉 Sales & Profit Trend (Monthly)
export const getSalesProfitTrend = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(transaction_date, 'YYYY-MM') AS month,
        SUM(sales_amount) AS total_sales,
        SUM(profit_amount) AS total_profit
      FROM sales
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    const labels = result.rows.map(r => r.month);
    const sales = result.rows.map(r => Number(r.total_sales));
    const profit = result.rows.map(r => Number(r.total_profit));

    res.json({ labels, sales, profit });
  } catch (err) {
    console.error("❌ getSalesProfitTrend error:", err.message);
    res.status(500).json({ message: "Gagal memuat data grafik sales/profit" });
  }
};

// 🌍 Tour Distribution by Region
export const getTourRegionData = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT region, COUNT(*) AS total_tours
      FROM tours
      WHERE region IS NOT NULL AND region <> ''
      GROUP BY region
      ORDER BY total_tours DESC
    `);

    const labels = result.rows.map(r => r.region);
    const counts = result.rows.map(r => Number(r.total_tours));

    res.json({ labels, counts });
  } catch (err) {
    console.error("❌ getTourRegionData error:", err.message);
    res.status(500).json({ message: "Gagal memuat distribusi tour region" });
  }
};