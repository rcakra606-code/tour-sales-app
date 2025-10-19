/**
 * ==========================================================
 * controllers/dashboardController.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Dashboard Summary
 * ✅ Chart Data (sales & profit bulanan)
 * ✅ Top 10 Staff
 * ✅ Hybrid DB Ready (Neon PostgreSQL + SQLite)
 * ==========================================================
 */

const db = require("../config/database").getDB();
const logger = require("../config/logger");

// ============================================================
// 📊 GET /api/dashboard/summary
// Menampilkan ringkasan utama dashboard
// ============================================================
exports.getDashboardSummary = async (req, res) => {
  try {
    const [salesTotal] = await db.all("SELECT SUM(sales_amount) AS total_sales, SUM(profit_amount) AS total_profit FROM sales");
    const [tourCount] = await db.all("SELECT COUNT(id) AS total_tours FROM tours");
    const [docCount] = await db.all("SELECT COUNT(id) AS total_documents FROM documents");
    const [userCount] = await db.all("SELECT COUNT(id) AS total_users FROM users");

    const summary = {
      total_sales: salesTotal?.total_sales || 0,
      total_profit: salesTotal?.total_profit || 0,
      total_tours: tourCount?.total_tours || 0,
      total_documents: docCount?.total_documents || 0,
      total_users: userCount?.total_users || 0,
    };

    logger.info("📊 Dashboard summary berhasil diambil");
    res.json(summary);
  } catch (err) {
    logger.error("❌ Gagal mengambil dashboard summary:", err);
    res.status(500).json({ message: "Gagal mengambil data dashboard summary" });
  }
};

// ============================================================
// 📈 GET /api/dashboard/chart-data
// Menampilkan data sales & profit bulanan untuk chart
// ============================================================
exports.getChartData = async (req, res) => {
  try {
    const query = `
      SELECT 
        strftime('%Y-%m', transaction_date) AS month,
        SUM(sales_amount) AS total_sales,
        SUM(profit_amount) AS total_profit
      FROM sales
      WHERE transaction_date IS NOT NULL
      GROUP BY strftime('%Y-%m', transaction_date)
      ORDER BY month ASC;
    `;

    const result = await db.all(query);
    const labels = result.map((r) => r.month);
    const sales = result.map((r) => r.total_sales);
    const profit = result.map((r) => r.total_profit);

    logger.info("📈 Data grafik dashboard berhasil diambil");
    res.json({ labels, sales, profit });
  } catch (err) {
    logger.error("❌ Gagal mengambil data chart:", err);
    res.status(500).json({ message: "Gagal mengambil data chart" });
  }
};

// ============================================================
// 🧑‍💼 GET /api/dashboard/top-staff
// Menampilkan top 10 staff berdasarkan sales (filter bulan/tahun opsional)
// ============================================================
exports.getTopStaff = async (req, res) => {
  try {
    const { month, year } = req.query;

    let query = `
      SELECT 
        staff_name,
        COUNT(id) AS total_transactions,
        SUM(sales_amount) AS total_sales,
        SUM(profit_amount) AS total_profit
      FROM sales
      WHERE staff_name IS NOT NULL AND TRIM(staff_name) != ''
    `;

    const params = [];
    if (month && year) {
      query += ` AND strftime('%m', transaction_date) = ? AND strftime('%Y', transaction_date) = ?`;
      params.push(month.padStart(2, "0"), year);
    } else if (year) {
      query += ` AND strftime('%Y', transaction_date) = ?`;
      params.push(year);
    }

    query += `
      GROUP BY staff_name
      ORDER BY total_sales DESC
      LIMIT 10;
    `;

    const topStaff = await db.all(query, params);
    logger.info("🏆 Data Top Staff berhasil diambil");
    res.json({ topStaff });
  } catch (err) {
    logger.error("❌ Gagal mengambil Top Staff:", err);
    res.status(500).json({ message: "Gagal mengambil data Top Staff" });
  }
};
