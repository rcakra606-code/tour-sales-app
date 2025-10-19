/**
 * ==========================================================
 * controllers/documentController.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ CRUD data dokumen
 * ✅ Kolom lengkap sesuai form input
 * ✅ Export Excel (XLSX)
 * ✅ Integrasi logger & keamanan
 * ==========================================================
 */

const db = require("../config/database");
const logger = require("../config/logger");
const ExcelJS = require("exceljs");

// ============================================================
// 📘 GET /api/documents
// Ambil semua data dokumen
// ============================================================
exports.getAllDocuments = async (req, res) => {
  try {
    const result = await db.all("SELECT * FROM documents ORDER BY receive_date DESC");
    res.json(result);
  } catch (err) {
    logger.error("❌ Error fetching documents:", err);
    res.status(500).json({ message: "Gagal mengambil data dokumen" });
  }
};

// ============================================================
// 📘 GET /api/documents/:id
// Ambil 1 data dokumen berdasarkan ID
// ============================================================
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.get("SELECT * FROM documents WHERE id = ?", [id]);
    if (!doc) return res.status(404).json({ message: "Data dokumen tidak ditemukan" });
    res.json(doc);
  } catch (err) {
    logger.error("❌ Error fetching document by ID:", err);
    res.status(500).json({ message: "Gagal mengambil data dokumen" });
  }
};

// ============================================================
// 🟢 POST /api/documents
// Tambah data dokumen baru
// ============================================================
exports.createDocument = async (req, res) => {
  try {
    const data = req.body;
    await db.run(
      `INSERT INTO documents 
      (receive_date, guest_name, booking_code, tour_code, document_remarks)
      VALUES (?, ?, ?, ?, ?)`,
      [
        data.receive_date,
        data.guest_name,
        data.booking_code,
        data.tour_code,
        data.document_remarks,
      ]
    );
    logger.info(`✅ Dokumen baru ditambahkan (${data.guest_name || "Tanpa Nama"})`);
    res.json({ message: "✅ Data dokumen berhasil ditambahkan" });
  } catch (err) {
    logger.error("❌ Error creating document:", err);
    res.status(500).json({ message: "Gagal menambah data dokumen" });
  }
};

// ============================================================
// 🟡 PUT /api/documents/:id
// Update data dokumen
// ============================================================
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const existing = await db.get("SELECT id FROM documents WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ message: "Data dokumen tidak ditemukan" });

    await db.run(
      `UPDATE documents 
       SET receive_date=?, guest_name=?, booking_code=?, tour_code=?, document_remarks=? 
       WHERE id=?`,
      [
        data.receive_date,
        data.guest_name,
        data.booking_code,
        data.tour_code,
        data.document_remarks,
        id,
      ]
    );

    logger.info(`✏️ Dokumen ID ${id} diperbarui (${data.guest_name || "Tanpa Nama"})`);
    res.json({ message: "✅ Data dokumen berhasil diperbarui" });
  } catch (err) {
    logger.error("❌ Error updating document:", err);
    res.status(500).json({ message: "Gagal memperbarui data dokumen" });
  }
};

// ============================================================
// 🔴 DELETE /api/documents/:id
// Hapus data dokumen
// ============================================================
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.get("SELECT id FROM documents WHERE id = ?", [id]);
    if (!existing) return res.status(404).json({ message: "Data dokumen tidak ditemukan" });

    await db.run("DELETE FROM documents WHERE id = ?", [id]);
    logger.info(`🗑️ Dokumen ID ${id} dihapus`);
    res.json({ message: "✅ Data dokumen berhasil dihapus" });
  } catch (err) {
    logger.error("❌ Error deleting document:", err);
    res.status(500).json({ message: "Gagal menghapus data dokumen" });
  }
};

// ============================================================
// 📤 GET /api/documents/export
// Export data dokumen ke Excel
// ============================================================
exports.exportDocumentReport = async (req, res) => {
  try {
    const filename = `Document_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Document Data");

    const data = await db.all("SELECT * FROM documents ORDER BY receive_date DESC");

    worksheet.columns = [
      { header: "Tanggal Terima", key: "receive_date", width: 18 },
      { header: "Nama Tamu", key: "guest_name", width: 20 },
      { header: "Kode Booking DMS", key: "booking_code", width: 20 },
      { header: "Tour Code", key: "tour_code", width: 15 },
      { header: "Remarks", key: "document_remarks", width: 30 },
    ];

    data.forEach((row) => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    await workbook.xlsx.write(res);
    res.end();

    logger.info(`📁 Exported Document Report: ${filename}`);
  } catch (err) {
    logger.error("❌ Error exporting document report:", err);
    res.status(500).json({ message: "Gagal mengekspor data dokumen" });
  }
};
