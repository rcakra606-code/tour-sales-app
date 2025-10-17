// controllers/executiveReportController.js — Multi-Sheet Excel Export
const path = require("path");
const Database = require("better-sqlite3");
const ExcelJS = require("exceljs");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

exports.exportExecutiveReport = async (req, res) => {
  try {
    const user = req.user;
    const { startDate, endDate } = req.query;
    const filters = [];
    const params = [];

    if (user.type === "basic") {
      filters.push("staff = ?");
      params.push(user.username);
    }

    if (startDate && endDate) {
      filters.push("date(reportDate) BETWEEN date(?) AND date(?)");
      params.push(startDate, endDate);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    // Workbook setup
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Travel Dashboard System";
    workbook.created = new Date();

    /* ===========================================================
       🧳 Sheet 1: Tours Report
    ============================================================ */
    const tours = db
      .prepare(`SELECT * FROM report_tours ${where} ORDER BY reportDate DESC`)
      .all(...params);

    const sheetTours = workbook.addWorksheet("Tour Reports");
    sheetTours.columns = [
      { header: "Report Date", key: "reportDate", width: 15 },
      { header: "Tour Code", key: "tourCode", width: 15 },
      { header: "Region", key: "region", width: 15 },
      { header: "Lead Passenger", key: "leadPassenger", width: 25 },
      { header: "Pax", key: "paxCount", width: 8 },
      { header: "Sales (IDR)", key: "salesAmount", width: 15 },
      { header: "Profit (IDR)", key: "profitAmount", width: 15 },
      { header: "Status", key: "departureStatus", width: 15 },
      { header: "Staff", key: "staff", width: 15 },
    ];
    sheetTours.getRow(1).font = { bold: true };
    tours.forEach((t) => sheetTours.addRow(t));

    /* ===========================================================
       💰 Sheet 2: Sales Report
    ============================================================ */
    const sales = db
      .prepare(`SELECT * FROM report_sales ${where} ORDER BY reportDate DESC`)
      .all(...params);

    const sheetSales = workbook.addWorksheet("Sales Reports");
    sheetSales.columns = [
      { header: "Report Date", key: "reportDate", width: 15 },
      { header: "Transaction Date", key: "transactionDate", width: 18 },
      { header: "Total Invoices", key: "totalInvoices", width: 15 },
      { header: "Sales Amount (IDR)", key: "salesAmount", width: 20 },
      { header: "Profit Amount (IDR)", key: "profitAmount", width: 20 },
      { header: "Staff", key: "staff", width: 15 },
    ];
    sheetSales.getRow(1).font = { bold: true };
    sales.forEach((s) => sheetSales.addRow(s));

    /* ===========================================================
       📄 Sheet 3: Document Report
    ============================================================ */
    const docs = db
      .prepare(`SELECT * FROM report_documents ${where} ORDER BY reportDate DESC`)
      .all(...params);

    const sheetDocs = workbook.addWorksheet("Document Reports");
    sheetDocs.columns = [
      { header: "Report Date", key: "reportDate", width: 15 },
      { header: "Total Files", key: "totalFiles", width: 12 },
      { header: "Completed", key: "completed", width: 12 },
      { header: "Pending", key: "pending", width: 12 },
      { header: "Rejected", key: "rejected", width: 12 },
      { header: "Remarks", key: "remarks", width: 30 },
      { header: "Staff", key: "staff", width: 15 },
    ];
    sheetDocs.getRow(1).font = { bold: true };
    docs.forEach((d) => sheetDocs.addRow(d));

    /* ===========================================================
       📊 Sheet 4: Executive Summary
    ============================================================ */
    const sumTours = db
      .prepare(`SELECT SUM(salesAmount) AS totalSales, SUM(profitAmount) AS totalProfit FROM report_tours ${where}`)
      .get(...params);
    const sumSales = db
      .prepare(`SELECT SUM(salesAmount) AS totalSales, SUM(profitAmount) AS totalProfit FROM report_sales ${where}`)
      .get(...params);
    const sumDocs = db
      .prepare(`SELECT SUM(totalFiles) AS totalFiles, SUM(completed) AS completed, SUM(pending) AS pending, SUM(rejected) AS rejected FROM report_documents ${where}`)
      .get(...params);

    const sheetSummary = workbook.addWorksheet("Executive Summary");
    sheetSummary.columns = [
      { header: "Category", key: "category", width: 25 },
      { header: "Metric", key: "metric", width: 25 },
      { header: "Value", key: "value", width: 20 },
    ];
    sheetSummary.getRow(1).font = { bold: true };

    sheetSummary.addRow({ category: "Tours", metric: "Total Sales (IDR)", value: sumTours.totalSales || 0 });
    sheetSummary.addRow({ category: "Tours", metric: "Total Profit (IDR)", value: sumTours.totalProfit || 0 });
    sheetSummary.addRow({ category: "Sales", metric: "Total Sales (IDR)", value: sumSales.totalSales || 0 });
    sheetSummary.addRow({ category: "Sales", metric: "Total Profit (IDR)", value: sumSales.totalProfit || 0 });
    sheetSummary.addRow({ category: "Documents", metric: "Total Files", value: sumDocs.totalFiles || 0 });
    sheetSummary.addRow({ category: "Documents", metric: "Completed", value: sumDocs.completed || 0 });
    sheetSummary.addRow({ category: "Documents", metric: "Pending", value: sumDocs.pending || 0 });
    sheetSummary.addRow({ category: "Documents", metric: "Rejected", value: sumDocs.rejected || 0 });

    /* ===========================================================
       ✅ Finalize & Send
    ============================================================ */
    const ts = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Disposition", `attachment; filename="executive_report_${ts}.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportExecutiveReport error:", err.message);
    res.status(500).json({ error: "Gagal mengekspor laporan executive." });
  }
};
