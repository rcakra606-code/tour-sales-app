// controllers/documentController.js — Final Production Version
const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/**
 * GET /api/documents
 * Ambil daftar dokumen dengan optional search dan pagination
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
 * Ringkasan untuk dashboard (total dokumen per status)
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
