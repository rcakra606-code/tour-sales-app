/**
 * ==========================================================
 * controllers/executiveReportController.js — Travel Dashboard Enterprise v3.9
 * ==========================================================
 * ✅ Laporan Eksekutif per Staff (Sales & Profit)
 * ✅ Filter Bulan & Tahun
 * ✅ Cache hasil summary
 * ✅ Export Excel (XLSX)
 * ==========================================================
 */

const db = require("../config/database");
const logger = require("../config/logger");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

// ============================================================
// 🧮 Helper: Format Nama Periode
// ============================================================
function getPeriodLabel(month, year) {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const monthName = month ? months[parseInt(month) - 1] : "Semua Bulan";
  return `${monthName} ${year || new Date().getFullYear()}`;
}

// ============================================================
// 📊 GET /api/executive/summary
// Ambil summary performa staff (dengan filter bulan & tahun)
// ============================================================
exports.getExecutiveSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const periodLabel = getPeriodLabel(month, year);
    const cacheKey = `${year || "ALL"}-${month || "ALL"}`;

    // 🔍 Cek cache
    const cached = await db.get("SELECT data FROM executive_cache WHERE cache_key = ?", [cacheKey]);
    if (cached) {
      logger.info(`📦 Cache ditemukan untuk ${cacheKey}`);
      return res.json(JSON.parse(cached.data));
    }

    // 🔹 Query utama
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

    if (month) {
      query += " AND STRFTIME('%m', transaction_date) = ?";
      params.push(month);
    }
    if (year) {
      query += " AND STRFTIME('%Y', transaction_date) = ?";
      params.push(year);
    }

    query += " GROUP BY staff_name ORDER BY total_sales DESC";

    const result = await db.all(query, params);

    const summaryData = { period: periodLabel, staffSummary: result };
    await db.run(
      "INSERT OR REPLACE INTO executive_cache (cache_key, data, created_at) VALUES (?, ?, DATETIME('now'))",
      [cacheKey, JSON.stringify(summaryData)]
    );

    res.json(summaryData);
  } catch (err) {
    logger.error("❌ Error fetching executive summary:", err);
    res.status(500).json({ message: "Gagal mengambil summary eksekutif" });
  }
};

// ============================================================
// 🧾 GET /api/executive/export
// Export laporan ke Excel (.xlsx)
// ============================================================
exports.exportExecutiveReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const periodLabel = getPeriodLabel(month, year);
    const cacheKey = `${year || "ALL"}-${month || "ALL"}`;

    // 🔍 Cek cache
    const cached = await db.get("SELECT data FROM executive_cache WHERE cache_key = ?", [cacheKey]);
    const data = cached ? JSON.parse(cached.data) : null;

    let staffSummary = data?.staffSummary;

    if (!staffSummary || staffSummary.length === 0) {
      // Jika belum ada cache, generate dulu
      const rows = await db.all(`
        SELECT staff_name,
               COUNT(id) AS total_transactions,
               SUM(sales_amount) AS total_sales,
               SUM(profit_amount) AS total_profit
        FROM sales
        WHERE staff_name IS NOT NULL AND TRIM(staff_name) != ''
        ${month ? "AND STRFTIME('%m', transaction_date) = ?" : ""}
        ${year ? "AND STRFTIME('%Y', transaction_date) = ?" : ""}
        GROUP BY staff_name
        ORDER BY total_sales DESC
      `, [month, year].filter(Boolean));
      staffSummary = rows;
    }

    // Buat workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Executive Report");

    worksheet.columns = [
      { header: "No", key: "no", width: 6 },
      { header: "Nama Staff", key: "staff_name", width: 25 },
      { header: "Total Transaksi", key: "total_transactions", width: 18 },
      { header: "Total Sales", key: "total_sales", width: 20 },
      { header: "Total Profit", key: "total_profit", width: 20 },
    ];

    staffSummary.forEach((row, index) => {
      worksheet.addRow({
        no: index + 1,
        staff_name: row.staff_name,
        total_transactions: row.total_transactions,
        total_sales: row.total_sales,
        total_profit: row.total_profit,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    const filename = `Executive_Report_${periodLabel.replace(/\s+/g, "_")}.xlsx`;
    const filepath = path.join(__dirname, `../data/${filename}`);

    await workbook.xlsx.writeFile(filepath);
    logger.info(`📁 Laporan eksekutif disimpan ke: ${filename}`);

    res.download(filepath, filename, (err) => {
      if (err) {
        logger.error("❌ Gagal mengunduh file Excel:", err);
      }
      setTimeout(() => fs.unlinkSync(filepath), 5000); // hapus file setelah 5 detik
    });
  } catch (err) {
    logger.error("❌ Error exporting executive report:", err);
    res.status(500).json({ message: "Gagal mengekspor laporan eksekutif" });
  }
};

// ============================================================
// 🧹 DELETE /api/executive/cache
// ============================================================
exports.clearExecutiveCache = async (req, res) => {
  try {
    await db.run("DELETE FROM executive_cache");
    logger.info("🧹 Cache laporan eksekutif dibersihkan");
    res.json({ message: "✅ Cache laporan eksekutif berhasil dihapus" });
  } catch (err) {
    logger.error("❌ Error clearing cache:", err);
    res.status(500).json({ message: "Gagal menghapus cache" });
  }
};

// ============================================================
// 🕒 GET /api/executive/cache/status
// ============================================================
exports.getCacheStatus = async (req, res) => {
  try {
    const result = await db.all(`
      SELECT cache_key, created_at 
      FROM executive_cache 
      ORDER BY created_at DESC
    `);

    res.json({ caches: result });
  } catch (err) {
    logger.error("❌ Error checking cache status:", err);
    res.status(500).json({ message: "Gagal memeriksa status cache" });
  }
};
