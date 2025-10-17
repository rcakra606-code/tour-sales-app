const db = require("../config/database");
const { logger } = require("../utils/logger");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { writeFileSync } = require("fs");
const ExcelJS = require("exceljs");

/**
 * 📊 Dashboard Summary
 */
exports.getSummary = (req, res) => {
  try {
    const totalSales =
      db.prepare("SELECT SUM(salesAmount) AS total FROM sales").get()?.total || 0;
    const totalProfit =
      db.prepare("SELECT SUM(profitAmount) AS total FROM sales").get()?.total || 0;
    const totalRegistrants =
      db.prepare("SELECT COUNT(*) AS total FROM tours").get()?.total || 0;
    const totalPax =
      db.prepare("SELECT SUM(paxCount) AS total FROM tours").get()?.total || 0;

    res.json({
      success: true,
      data: { totalSales, totalProfit, totalRegistrants, totalPax },
    });
  } catch (err) {
    logger.error("❌ dashboard.getSummary failed: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 📈 Chart Data
 */
exports.getCharts = (req, res) => {
  try {
    const staffRows = db
      .prepare(`
        SELECT staff, SUM(salesAmount) AS sales, SUM(profitAmount) AS profit
        FROM sales
        GROUP BY staff
      `)
      .all();

    const regionRows = db
      .prepare(`
        SELECT region, COUNT(*) AS count
        FROM tours
        GROUP BY region
      `)
      .all();

    res.json({ success: true, data: { staffRows, regionRows } });
  } catch (err) {
    logger.error("❌ dashboard.getCharts failed: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🗓️ Sales Overview
 */
exports.getSalesOverview = (req, res) => {
  try {
    const rows = db
      .prepare(`
        SELECT DATE(transactionDate) AS date,
               SUM(salesAmount) AS totalSales,
               SUM(profitAmount) AS totalProfit
        FROM sales
        GROUP BY DATE(transactionDate)
        ORDER BY date DESC
        LIMIT 14
      `)
      .all();

    res.json({ success: true, data: rows });
  } catch (err) {
    logger.error("❌ dashboard.getSalesOverview failed: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 📤 Export Report (JSON / CSV / Excel)
 * Example: /api/dashboard/report?format=csv
 */
exports.exportReport = async (req, res) => {
  try {
    const format = req.query.format || "json";

    const rows = db
      .prepare(`
        SELECT s.id, s.transactionDate, s.invoiceNumber,
               s.salesAmount, s.profitAmount, s.staff,
               t.tourCode, t.region, t.leadPassenger, t.paxCount
        FROM sales s
        LEFT JOIN tours t ON s.tourId = t.id
        ORDER BY s.transactionDate DESC
      `)
      .all();

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Tidak ada data sales." });
    }

    // === JSON ===
    if (format === "json") {
      return res.json({ success: true, data: rows });
    }

    // === CSV ===
    if (format === "csv") {
      const csvHeader = Object.keys(rows[0]).join(",") + "\n";
      const csvRows = rows
        .map((r) => Object.values(r).map((v) => `"${v ?? ""}"`).join(","))
        .join("\n");

      const csvData = csvHeader + csvRows;
      const filePath = path.join(os.tmpdir(), `sales_report_${Date.now()}.csv`);
      writeFileSync(filePath, csvData);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="sales_report.csv"');
      return res.download(filePath);
    }

    // === XLSX (Excel) ===
    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Sales Report");

      sheet.columns = Object.keys(rows[0]).map((key) => ({
        header: key,
        key,
        width: 20,
      }));

      sheet.addRows(rows);

      const filePath = path.join(os.tmpdir(), `sales_report_${Date.now()}.xlsx`);
      await workbook.xlsx.writeFile(filePath);

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="sales_report.xlsx"'
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.download(filePath);
    }

    // === Format tidak dikenali ===
    return res.status(400).json({
      success: false,
      message: "Format tidak dikenali. Gunakan ?format=json|csv|xlsx",
    });
  } catch (err) {
    logger.error("❌ dashboard.exportReport failed: " + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
