// controllers/documentController.js — Final with Export Feature
const path = require("path");
const Database = require("better-sqlite3");
const ExcelJS = require("exceljs");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/**
 * GET /api/documents
 * Ambil daftar dokumen
 */
exports.getDocuments = (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const totalRow = db
      .prepare(
        `SELECT COUNT(*) AS c FROM documents 
         WHERE guestNames LIKE ? OR bookingCodeDMS LIKE ? OR tourCode LIKE ?`
      )
      .get(search, search, search);
    const total = totalRow.c || 0;
    const totalPages = Math.ceil(total / limit);

    const documents = db
      .prepare(
        `SELECT * FROM documents 
         WHERE guestNames LIKE ? OR bookingCodeDMS LIKE ? OR tourCode LIKE ?
         ORDER BY documentReceiveDate DESC
         LIMIT ? OFFSET ?`
      )
      .all(search, search, search, limit, offset);

    res.json({ data: documents, total, page, totalPages });
  } catch (err) {
    console.error("getDocuments error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data dokumen." });
  }
};

/**
 * POST /api/documents
 * Tambah dokumen baru
 */
exports.createDocument = (req, res) => {
  try {
    const {
      documentReceiveDate,
      guestNames,
      bookingCodeDMS,
      tourCode,
      documentRemarks,
      documentStatus,
    } = req.body;

    if (!guestNames || !tourCode)
      return res.status(400).json({ error: "Nama tamu dan Tour Code wajib diisi." });

    db.prepare(
      `INSERT INTO documents 
       (documentReceiveDate, guestNames, bookingCodeDMS, tourCode, documentRemarks, documentStatus)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      documentReceiveDate || "",
      guestNames,
      bookingCodeDMS || "",
      tourCode,
      documentRemarks || "",
      documentStatus || "Pending"
    );

    res.json({ ok: true, message: "Data dokumen berhasil ditambahkan." });
  } catch (err) {
    console.error("createDocument error:", err.message);
    res.status(500).json({ error: "Gagal menambah data dokumen." });
  }
};

/**
 * DELETE /api/documents/:id
 * Hapus dokumen
 */
exports.deleteDocument = (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID tidak diberikan." });

    db.prepare("DELETE FROM documents WHERE id = ?").run(id);
    res.json({ ok: true, message: "Dokumen dihapus." });
  } catch (err) {
    console.error("deleteDocument error:", err.message);
    res.status(500).json({ error: "Gagal menghapus dokumen." });
  }
};

/**
 * GET /api/documents/summary
 * Ringkasan untuk dashboard
 */
exports.getDocumentSummary = (req, res) => {
  try {
    const totalDocs = db.prepare("SELECT COUNT(*) AS c FROM documents").get().c || 0;

    const statusSummary = db
      .prepare(
        `SELECT documentStatus, COUNT(*) AS total 
         FROM documents 
         GROUP BY documentStatus`
      )
      .all();

    const latestDocs = db
      .prepare(
        `SELECT guestNames, tourCode, documentStatus, documentReceiveDate
         FROM documents 
         ORDER BY documentReceiveDate DESC 
         LIMIT 5`
      )
      .all();

    res.json({ totalDocs, statusSummary, latestDocs });
  } catch (err) {
    console.error("getDocumentSummary error:", err.message);
    res.status(500).json({ error: "Gagal mengambil ringkasan dokumen." });
  }
};

/**
 * GET /api/documents/export/excel
 * Export data dokumen ke Excel
 */
exports.exportDocumentsExcel = async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    let where = "WHERE (guestNames LIKE ? OR tourCode LIKE ?)";
    const params = [search, search];
    if (startDate && endDate) {
      where += " AND documentReceiveDate BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const rows = db
      .prepare(
        `SELECT * FROM documents ${where} ORDER BY documentReceiveDate DESC`
      )
      .all(...params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Documents Export");

    sheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Tanggal Terima", key: "documentReceiveDate", width: 18 },
      { header: "Nama Tamu", key: "guestNames", width: 30 },
      { header: "Booking Code DMS", key: "bookingCodeDMS", width: 20 },
      { header: "Tour Code", key: "tourCode", width: 15 },
      { header: "Status", key: "documentStatus", width: 15 },
      { header: "Catatan", key: "documentRemarks", width: 40 }
    ];

    rows.forEach(r => sheet.addRow(r));
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    const ts = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
    const filename = `documents_export_${ts}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportDocumentsExcel error:", err.message);
    res.status(500).json({ error: "Gagal mengekspor ke Excel." });
  }
};

/**
 * GET /api/documents/export/csv
 * Export data dokumen ke CSV
 */
exports.exportDocumentsCSV = (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    let where = "WHERE (guestNames LIKE ? OR tourCode LIKE ?)";
    const params = [search, search];
    if (startDate && endDate) {
      where += " AND documentReceiveDate BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const rows = db
      .prepare(
        `SELECT * FROM documents ${where} ORDER BY documentReceiveDate DESC`
      )
      .all(...params);

    const header = [
      "ID",
      "Tanggal Terima",
      "Nama Tamu",
      "Booking Code DMS",
      "Tour Code",
      "Status",
      "Catatan"
    ];

    const escapeCsv = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines = [header.join(",")];
    rows.forEach(r => {
      lines.push([
        r.id,
        r.documentReceiveDate,
        r.guestNames,
        r.bookingCodeDMS,
        r.tourCode,
        r.documentStatus,
        r.documentRemarks
      ].map(escapeCsv).join(","));
    });

    const csv = lines.join("\n");
    const ts = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
    const filename = `documents_export_${ts}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error("exportDocumentsCSV error:", err.message);
    res.status(500).json({ error: "Gagal mengekspor ke CSV." });
  }
};
