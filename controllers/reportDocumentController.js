// controllers/reportDocumentController.js — Final Version (Role-Based CRUD + Export)
const path = require("path");
const Database = require("better-sqlite3");
const ExcelJS = require("exceljs");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/* ===========================================================
   📋 GET /api/report/documents
   Semua user bisa lihat, basic hanya miliknya
=========================================================== */
exports.getReports = (req, res) => {
  try {
    const user = req.user;
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    let rows = [];

    if (user.type === "basic") {
      rows = db
        .prepare(
          `SELECT * FROM report_documents 
           WHERE staff = ? AND (remarks LIKE ?) 
           ORDER BY reportDate DESC`
        )
        .all(user.username, search);
    } else {
      rows = db
        .prepare(
          `SELECT * FROM report_documents 
           WHERE remarks LIKE ? 
           ORDER BY reportDate DESC`
        )
        .all(search);
    }

    res.json(rows);
  } catch (err) {
    console.error("getReports error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data laporan dokumen." });
  }
};

/* ===========================================================
   ➕ POST /api/report/documents
   Hanya Admin & Semi Admin yang bisa tambah data
=========================================================== */
exports.createReport = (req, res) => {
  try {
    const user = req.user;
    if (user.type === "basic")
      return res.status(403).json({ error: "Anda tidak memiliki izin menambah laporan dokumen." });

    const data = req.body;
    db.prepare(
      `INSERT INTO report_documents (
        reportDate, totalFiles, completed, pending, rejected, remarks, staff
      ) VALUES (?,?,?,?,?,?,?)`
    ).run(
      data.reportDate || new Date().toISOString().split("T")[0],
      data.totalFiles || 0,
      data.completed || 0,
      data.pending || 0,
      data.rejected || 0,
      data.remarks || "",
      data.staff || user.username
    );

    res.json({ ok: true, message: "Laporan dokumen berhasil ditambahkan." });
  } catch (err) {
    console.error("createReport error:", err.message);
    res.status(500).json({ error: "Gagal menambah laporan dokumen." });
  }
};

/* ===========================================================
   ✏️ PUT /api/report/documents/:id
   Hanya Admin & Semi Admin bisa edit
=========================================================== */
exports.updateReport = (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (user.type === "basic")
      return res.status(403).json({ error: "Anda tidak memiliki izin mengubah laporan dokumen." });

    const existing = db.prepare("SELECT * FROM report_documents WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ error: "Data tidak ditemukan." });

    const data = req.body;
    db.prepare(
      `UPDATE report_documents 
       SET reportDate=?, totalFiles=?, completed=?, pending=?, rejected=?, remarks=?, staff=? 
       WHERE id=?`
    ).run(
      data.reportDate || existing.reportDate,
      data.totalFiles || existing.totalFiles,
      data.completed || existing.completed,
      data.pending || existing.pending,
      data.rejected || existing.rejected,
      data.remarks || existing.remarks,
      data.staff || existing.staff,
      id
    );

    res.json({ ok: true, message: "Laporan dokumen berhasil diperbarui." });
  } catch (err) {
    console.error("updateReport error:", err.message);
    res.status(500).json({ error: "Gagal memperbarui laporan dokumen." });
  }
};

/* ===========================================================
   🗑️ DELETE /api/report/documents/:id
   Hanya Admin & Semi Admin bisa hapus
=========================================================== */
exports.deleteReport = (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (user.type === "basic")
      return res.status(403).json({ error: "Anda tidak memiliki izin menghapus laporan dokumen." });

    const existing = db.prepare("SELECT * FROM report_documents WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ error: "Data tidak ditemukan." });

    db.prepare("DELETE FROM report_documents WHERE id = ?").run(id);
    res.json({ ok: true, message: "Laporan dokumen dihapus." });
  } catch (err) {
    console.error("deleteReport error:", err.message);
    res.status(500).json({ error: "Gagal menghapus laporan dokumen." });
  }
};

/* ===========================================================
   📊 GET /api/report/documents/summary
   Statistik dokumen
=========================================================== */
exports.getSummary = (req, res) => {
  try {
    const user = req.user;
    let condition = "";
    let param = [];

    if (user.type === "basic") {
      condition = "WHERE staff = ?";
      param.push(user.username);
    }

    const totalReports = db.prepare(`SELECT COUNT(*) AS total FROM report_documents ${condition}`).get(...param).total || 0;
    const totalFiles = db.prepare(`SELECT SUM(totalFiles) AS total FROM report_documents ${condition}`).get(...param).total || 0;
    const completed = db.prepare(`SELECT SUM(completed) AS total FROM report_documents ${condition}`).get(...param).total || 0;
    const pending = db.prepare(`SELECT SUM(pending) AS total FROM report_documents ${condition}`).get(...param).total || 0;
    const rejected = db.prepare(`SELECT SUM(rejected) AS total FROM report_documents ${condition}`).get(...param).total || 0;

    res.json({ totalReports, totalFiles, completed, pending, rejected });
  } catch (err) {
    console.error("getSummary error:", err.message);
    res.status(500).json({ error: "Gagal mengambil ringkasan laporan dokumen." });
  }
};

/* ===========================================================
   📤 GET /api/report/documents/export/excel
=========================================================== */
exports.exportExcel = async (req, res) => {
  try {
    const user = req.user;
    const rows =
      user.type === "basic"
        ? db.prepare("SELECT * FROM report_documents WHERE staff = ?").all(user.username)
        : db.prepare("SELECT * FROM report_documents").all();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Document Reports");

    sheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Tanggal Laporan", key: "reportDate", width: 18 },
      { header: "Total File", key: "totalFiles", width: 12 },
      { header: "Completed", key: "completed", width: 12 },
      { header: "Pending", key: "pending", width: 12 },
      { header: "Rejected", key: "rejected", width: 12 },
      { header: "Catatan", key: "remarks", width: 30 },
      { header: "Staff", key: "staff", width: 15 },
    ];

    rows.forEach(r => sheet.addRow(r));
    sheet.getRow(1).font = { bold: true };

    const ts = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Disposition", `attachment; filename="document_report_${ts}.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportExcel error:", err.message);
    res.status(500).json({ error: "Gagal mengekspor laporan dokumen." });
  }
};
