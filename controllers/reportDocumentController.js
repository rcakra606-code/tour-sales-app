// ==========================================================
// 📑 Report Document Controller — Travel Dashboard Enterprise v5.4.5
// ==========================================================
// Fitur:
// - Ambil semua laporan dokumen
// - Filter berdasarkan staff / tanggal
// - Export ke Excel atau CSV
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
// 🔹 GET /api/report/document — Semua laporan dokumen
// ==========================================================
export async function getAllDocuments(req, res) {
  try {
    const q = `
      SELECT id, received_date, sent_date, guest_name, document_type,
             process_type, booking_code, invoice_number, staff_name, tour_code, created_at
      FROM documents
      ORDER BY received_date DESC;
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ getAllDocuments error:", err);
    res.status(500).json({ message: "Gagal memuat data dokumen" });
  }
}

// ==========================================================
// 🔹 GET /api/report/document/staff/:staff_name — Filter per staff
// ==========================================================
export async function getDocumentsByStaff(req, res) {
  try {
    const { staff_name } = req.params;
    const q = `
      SELECT id, received_date, sent_date, guest_name, document_type,
             process_type, booking_code, invoice_number, staff_name, tour_code
      FROM documents
      WHERE LOWER(staff_name) = LOWER($1)
      ORDER BY received_date DESC;
    `;
    const { rows } = await pool.query(q, [staff_name]);
    res.json(rows);
  } catch (err) {
    console.error("❌ getDocumentsByStaff error:", err);
    res.status(500).json({ message: "Gagal memuat laporan dokumen per staff" });
  }
}

// ==========================================================
// 🔹 GET /api/report/document/summary — Ringkasan dokumen per bulan
// ==========================================================
export async function getDocumentSummary(req, res) {
  try {
    const q = `
      SELECT
        staff_name,
        COUNT(*) AS total_docs,
        DATE_TRUNC('month', received_date) AS month
      FROM documents
      GROUP BY staff_name, DATE_TRUNC('month', received_date)
      ORDER BY month DESC, staff_name ASC;
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ getDocumentSummary error:", err);
    res.status(500).json({ message: "Gagal memuat ringkasan dokumen" });
  }
}

// ==========================================================
// 🔹 GET /api/report/document/export — Export Excel / CSV
// ==========================================================
export async function exportDocumentReport(req, res) {
  try {
    const format = req.query.format || "xlsx";

    const q = `
      SELECT id, received_date, sent_date, guest_name, document_type,
             process_type, booking_code, invoice_number, staff_name, tour_code
      FROM documents
      ORDER BY received_date DESC;
    `;
    const { rows } = await pool.query(q);

    if (rows.length === 0)
      return res.status(404).json({ message: "Tidak ada data dokumen untuk diekspor" });

    // ------------------------------------------------------
    // 📘 Export ke Excel
    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Document Report");

      sheet.columns = [
        { header: "No", key: "id", width: 5 },
        { header: "Tanggal Terima", key: "received_date", width: 15 },
        { header: "Tanggal Kirim", key: "sent_date", width: 15 },
        { header: "Nama Tamu", key: "guest_name", width: 20 },
        { header: "Jenis Dokumen", key: "document_type", width: 20 },
        { header: "Proses", key: "process_type", width: 15 },
        { header: "Booking Code", key: "booking_code", width: 15 },
        { header: "Invoice", key: "invoice_number", width: 15 },
        { header: "Staff", key: "staff_name", width: 20 },
        { header: "Tour Code", key: "tour_code", width: 15 },
      ];

      rows.forEach((row) => sheet.addRow(row));

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=document_report.xlsx");

      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    // ------------------------------------------------------
    // 📄 Export ke CSV
    if (format === "csv") {
      const csv = parse(rows);
      res.header("Content-Type", "text/csv");
      res.attachment("document_report.csv");
      res.send(csv);
      return;
    }

    return res.status(400).json({ message: "Format tidak dikenali (gunakan xlsx atau csv)" });
  } catch (err) {
    console.error("❌ exportDocumentReport error:", err);
    res.status(500).json({ message: "Gagal mengekspor laporan dokumen" });
  }
}