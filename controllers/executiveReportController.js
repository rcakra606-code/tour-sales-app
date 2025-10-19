/**
 * ==========================================================
 * controllers/executiveReportController.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ Summary performa staff (sales, profit, transaksi)
 * ✅ Filter bulan & tahun
 * ✅ Export ke Excel (.xlsx)
 * ✅ Cache laporan eksekutif
 * ==========================================================
 */

const db = require("../config/database").getDB();
const logger = require("../config/logger");
const ExcelJS = require("exceljs");

// Cache sederhana untuk laporan executive
let executiveCache = {
  data: null,
  lastUpdated: null,
  month: null,
  year: null,
};

// ============================================================
// 📊 GET /api/executive/summary
// Ambil summary laporan eksekutif (dengan filter bulan & tahun)
// ============================================================
exports.getExecutiveSummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Gunakan cache jika data sama dan masih valid (< 10 menit)
    const now = Date.now();
    if (
      executiveCache.data &&
      executiveCache.month === month &&
      executiveCache.year === year &&
      now - executiveCache.lastUpdated < 10 * 60 * 1000
    ) {
      logger.info("⚡ Menggunakan cached executive summary");
      return res.json({ cached: true, summary: executiveCache.data });
    }

    let query = `
      SELECT 
        staff_name AS staff,
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

    const summary = await db.all(query, params);

    // Simpan ke cache
    executiveCache = {
      data: summary,
      lastUpdated: Date.now(),
      month,
      year,
    };

    logger.info("✅ Executive summary berhasil diambil dari database");
    res.json({ cached: false, summary });
  } catch (err) {
    logger.error("❌ Error mengambil executive summary:", err);
    res.status(500).json({ message: "Gagal mengambil data executive report" });
  }
};

// ============================================================
// 📤 GET /api/executive/export
// Export laporan eksekutif ke Excel
// ============================================================
exports.exportExecutiveReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filename = `Executive_Report_${year || "All"}_${month || "All"}.xlsx`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Executive Report");

    worksheet.columns = [
      { header: "Nama Staff", key: "staff", width: 25 },
      { header: "Total Transaksi", key: "total_transactions", width: 18 },
      { header: "Total Sales", key: "total_sales", width: 18 },
      { header: "Total Profit", key: "total_profit", width: 18 },
    ];

    let query = `
      SELECT 
        staff_name AS staff,
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

    const data = await db.all(query, params);

    data.forEach((row) => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    await workbook.xlsx.write(res);
    res.end();

    logger.info(`📁 Exported Executive Report: ${filename}`);
  } catch (err) {
    logger.error("❌ Error exporting executive report:", err);
    res.status(500).json({ message: "Gagal mengekspor laporan eksekutif" });
  }
};

// ============================================================
// 🧹 DELETE /api/executive/cache
// Bersihkan cache laporan eksekutif
// ============================================================
exports.clearExecutiveCache = (req, res) => {
  executiveCache = { data: null, lastUpdated: null, month: null, year: null };
  logger.warn(`🧹 Cache executive report dibersihkan oleh ${req.user.username}`);
  res.json({ message: "✅ Cache laporan eksekutif berhasil dibersihkan" });
};

// ============================================================
// 🕒 GET /api/executive/cache/status
// Cek status cache laporan eksekutif
// ============================================================
exports.getCacheStatus = (req, res) => {
  if (!executiveCache.data) {
    return res.json({ cache: "empty", lastUpdated: null });
  }

  res.json({
    cache: "active",
    lastUpdated: new Date(executiveCache.lastUpdated).toISOString(),
    month: executiveCache.month,
    year: executiveCache.year,
  });
};
