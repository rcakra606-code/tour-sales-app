// ==========================================================
// 💹 Report Sales Controller — Travel Dashboard Enterprise v5.4.5
// ==========================================================
// Fitur:
// - Laporan penjualan per staff dan keseluruhan
// - Rekap target vs pencapaian
// - Export Excel / CSV
// ==========================================================

import pkg from "pg";
import ExcelJS from "exceljs";
import { parse } from "json2csv";

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/report/sales — Semua laporan sales
// ==========================================================
export async function getAllSalesReport(req, res) {
  try {
    const q = `
      SELECT id, staff_name, transaction_date, invoice_number, sales_amount, profit_amount, remarks, created_at
      FROM sales
      ORDER BY transaction_date DESC;
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ getAllSalesReport error:", err);
    res.status(500).json({ message: "Gagal memuat laporan penjualan" });
  }
}

// ==========================================================
// 🔹 GET /api/report/sales/staff/:staff_name — Laporan per staff
// ==========================================================
export async function getSalesByStaff(req, res) {
  try {
    const { staff_name } = req.params;
    const q = `
      SELECT id, transaction_date, invoice_number, sales_amount, profit_amount, remarks
      FROM sales
      WHERE LOWER(staff_name) = LOWER($1)
      ORDER BY transaction_date DESC;
    `;
    const { rows } = await pool.query(q, [staff_name]);
    res.json(rows);
  } catch (err) {
    console.error("❌ getSalesByStaff error:", err);
    res.status(500).json({ message: "Gagal memuat laporan penjualan staff" });
  }
}

// ==========================================================
// 🔹 GET /api/report/sales/summary — Target vs Pencapaian
// ==========================================================
export async function getSalesSummary(req, res) {
  try {
    const q = `
      SELECT
        s.staff_name,
        COALESCE(SUM(s.sales_amount), 0) AS total_sales,
        COALESCE(SUM(s.profit_amount), 0) AS total_profit,
        COALESCE(t.target_sales, 0) AS target_sales,
        COALESCE(t.target_profit, 0) AS target_profit,
        CASE 
          WHEN t.target_sales > 0 THEN ROUND((SUM(s.sales_amount) / t.target_sales) * 100, 2)
          ELSE 0
        END AS sales_achievement,
        CASE 
          WHEN t.target_profit > 0 THEN ROUND((SUM(s.profit_amount) / t.target_profit) * 100, 2)
          ELSE 0
        END AS profit_achievement
      FROM sales s
      LEFT JOIN targets t 
      ON LOWER(s.staff_name) = LOWER(t.staff_name)
      GROUP BY s.staff_name, t.target_sales, t.target_profit
      ORDER BY s.staff_name ASC;
    `;

    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ getSalesSummary error:", err);
    res.status(500).json({ message: "Gagal memuat ringkasan target dan pencapaian" });
  }
}

// ==========================================================
// 🔹 GET /api/report/sales/export — Export ke Excel / CSV
// ==========================================================
export async function exportSalesReport(req, res) {
  try {
    const format = req.query.format || "xlsx";

    const q = `
      SELECT id, staff_name, transaction_date, invoice_number, sales_amount, profit_amount, remarks
      FROM sales
      ORDER BY transaction_date DESC;
    `;
    const { rows } = await pool.query(q);

    if (rows.length === 0)
      return res.status(404).json({ message: "Tidak ada data penjualan untuk diekspor" });

    // ------------------------------------------------------
    // 📘 Export Excel
    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Sales Report");

      sheet.columns = [
        { header: "No", key: "id", width: 5 },
        { header: "Nama Staff", key: "staff_name", width: 20 },
        { header: "Tanggal Transaksi", key: "transaction_date", width: 20 },
        { header: "Nomor Invoice", key: "invoice_number", width: 20 },
        { header: "Total Sales", key: "sales_amount", width: 15 },
        { header: "Profit", key: "profit_amount", width: 15 },
        { header: "Keterangan", key: "remarks", width: 25 },
      ];

      rows.forEach((row) => sheet.addRow(row));

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=sales_report.xlsx");

      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    // ------------------------------------------------------
    // 📄 Export CSV
    if (format === "csv") {
      const csv = parse(rows);
      res.header("Content-Type", "text/csv");
      res.attachment("sales_report.csv");
      res.send(csv);
      return;
    }

    // ------------------------------------------------------
    // ❌ Format tidak dikenal
    return res.status(400).json({ message: "Format tidak dikenali (gunakan xlsx atau csv)" });
  } catch (err) {
    console.error("❌ exportSalesReport error:", err);
    res.status(500).json({ message: "Gagal mengekspor laporan penjualan" });
  }
}