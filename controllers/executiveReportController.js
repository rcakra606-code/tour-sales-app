// ==========================================================
// 📈 Travel Dashboard Enterprise v5.3.2
// Executive Report Controller (Monthly Performance + Fix Neon Date Error)
// ==========================================================
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 📊 Monthly Performance (Sales + Profit per Month)
export const getMonthlyPerformance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(date_trunc('month', TO_DATE(transaction_date::text, 'YYYY-MM-DD')), 'Mon YYYY') AS month,
        SUM(sales_amount) AS total_sales,
        SUM(profit_amount) AS total_profit
      FROM sales
      WHERE transaction_date IS NOT NULL
      GROUP BY 1
      ORDER BY MIN(TO_DATE(transaction_date::text, 'YYYY-MM-DD')) ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Monthly performance error:", err.message);
    res.status(500).json({ message: "Gagal memuat data performa bulanan" });
  }
};