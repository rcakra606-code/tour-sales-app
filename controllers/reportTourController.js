// controllers/reportTourController.js — Final Version (Role-Based + CRUD + Export)
const path = require("path");
const Database = require("better-sqlite3");
const ExcelJS = require("exceljs");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/* ===========================================================
   📋 GET /api/report/tours
   Semua user bisa lihat, tapi basic hanya data miliknya
=========================================================== */
exports.getReports = (req, res) => {
  try {
    const user = req.user;
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    let rows = [];

    if (user.type === "basic") {
      rows = db
        .prepare(
          `SELECT * FROM report_tours 
           WHERE staff = ? AND (leadPassenger LIKE ? OR tourCode LIKE ?) 
           ORDER BY registrationDate DESC`
        )
        .all(user.username, search, search);
    } else {
      rows = db
        .prepare(
          `SELECT * FROM report_tours 
           WHERE leadPassenger LIKE ? OR tourCode LIKE ? 
           ORDER BY registrationDate DESC`
        )
        .all(search, search);
    }

    res.json(rows);
  } catch (err) {
    console.error("getReports error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data laporan tour." });
  }
};

/* ===========================================================
   ➕ POST /api/report/tours
   Semua user bisa tambah data
=========================================================== */
exports.createReport = (req, res) => {
  try {
    const data = req.body;
    const staff = req.user.username;

    db.prepare(
      `INSERT INTO report_tours (
        reportDate, registrationDate, leadPassenger, allPassengers, paxCount,
        tourCode, region, departureDate, bookingCode, tourPrice, discountRemarks,
        paymentProof, documentReceived, visaProcessStart, visaProcessEnd,
        documentRemarks, staff, salesAmount, profitAmount, departureStatus
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      data.reportDate || new Date().toISOString().split("T")[0],
      data.registrationDate || "",
      data.leadPassenger || "",
      data.allPassengers || "",
      data.paxCount || 0,
      data.tourCode || "",
      data.region || "",
      data.departureDate || "",
      data.bookingCode || "",
      data.tourPrice || 0,
      data.discountRemarks || "",
      data.paymentProof || "",
      data.documentReceived || "",
      data.visaProcessStart || "",
      data.visaProcessEnd || "",
      data.documentRemarks || "",
      staff,
      data.salesAmount || 0,
      data.profitAmount || 0,
      data.departureStatus || "PENDING"
    );

    res.json({ ok: true, message: "Laporan tour berhasil ditambahkan." });
  } catch (err) {
    console.error("createReport error:", err.message);
    res.status(500).json({ error: "Gagal menambah laporan tour." });
  }
};

/* ===========================================================
   ✏️ PUT /api/report/tours/:id
   Semua user bisa edit, tapi basic hanya data miliknya
=========================================================== */
exports.updateReport = (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const data = req.body;

    const existing = db.prepare("SELECT * FROM report_tours WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ error: "Data tidak ditemukan." });

    if (user.type === "basic" && existing.staff !== user.username)
      return res.status(403).json({ error: "Tidak diizinkan mengubah data orang lain." });

    db.prepare(
      `UPDATE report_tours SET 
        reportDate=?, registrationDate=?, leadPassenger=?, allPassengers=?, paxCount=?,
        tourCode=?, region=?, departureDate=?, bookingCode=?, tourPrice=?, discountRemarks=?,
        paymentProof=?, documentReceived=?, visaProcessStart=?, visaProcessEnd=?, documentRemarks=?,
        salesAmount=?, profitAmount=?, departureStatus=? WHERE id=?`
    ).run(
      data.reportDate || existing.reportDate,
      data.registrationDate || existing.registrationDate,
      data.leadPassenger || existing.leadPassenger,
      data.allPassengers || existing.allPassengers,
      data.paxCount || existing.paxCount,
      data.tourCode || existing.tourCode,
      data.region || existing.region,
      data.departureDate || existing.departureDate,
      data.bookingCode || existing.bookingCode,
      data.tourPrice || existing.tourPrice,
      data.discountRemarks || existing.discountRemarks,
      data.paymentProof || existing.paymentProof,
      data.documentReceived || existing.documentReceived,
      data.visaProcessStart || existing.visaProcessStart,
      data.visaProcessEnd || existing.visaProcessEnd,
      data.documentRemarks || existing.documentRemarks,
      data.salesAmount || existing.salesAmount,
      data.profitAmount || existing.profitAmount,
      data.departureStatus || existing.departureStatus,
      id
    );

    res.json({ ok: true, message: "Laporan tour diperbarui." });
  } catch (err) {
    console.error("updateReport error:", err.message);
    res.status(500).json({ error: "Gagal memperbarui laporan tour." });
  }
};

/* ===========================================================
   🗑️ DELETE /api/report/tours/:id
   Semua user bisa hapus data miliknya
=========================================================== */
exports.deleteReport = (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const existing = db.prepare("SELECT * FROM report_tours WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ error: "Data tidak ditemukan." });
    if (user.type === "basic" && existing.staff !== user.username)
      return res.status(403).json({ error: "Tidak diizinkan menghapus data orang lain." });

    db.prepare("DELETE FROM report_tours WHERE id = ?").run(id);
    res.json({ ok: true, message: "Laporan tour dihapus." });
  } catch (err) {
    console.error("deleteReport error:", err.message);
    res.status(500).json({ error: "Gagal menghapus laporan tour." });
  }
};

/* ===========================================================
   📊 GET /api/report/tours/summary
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

    const totalTours = db.prepare(`SELECT COUNT(*) AS total FROM report_tours ${condition}`).get(...param).total || 0;
    const totalSales = db.prepare(`SELECT SUM(salesAmount) AS total FROM report_tours ${condition}`).get(...param).total || 0;
    const totalProfit = db.prepare(`SELECT SUM(profitAmount) AS total FROM report_tours ${condition}`).get(...param).total || 0;

    const byStatus = db.prepare(`SELECT departureStatus, COUNT(*) AS total FROM report_tours ${condition} GROUP BY departureStatus`).all(...param);

    res.json({ totalTours, totalSales, totalProfit, byStatus });
  } catch (err) {
    console.error("getSummary error:", err.message);
    res.status(500).json({ error: "Gagal mengambil ringkasan laporan tour." });
  }
};

/* ===========================================================
   📤 EXPORT /api/report/tours/export/excel
=========================================================== */
exports.exportExcel = async (req, res) => {
  try {
    const user = req.user;
    const rows =
      user.type === "basic"
        ? db.prepare("SELECT * FROM report_tours WHERE staff = ?").all(user.username)
        : db.prepare("SELECT * FROM report_tours").all();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Tour Reports");
    sheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Tour Code", key: "tourCode", width: 15 },
      { header: "Region", key: "region", width: 15 },
      { header: "Lead Passenger", key: "leadPassenger", width: 20 },
      { header: "Pax", key: "paxCount", width: 8 },
      { header: "Sales (IDR)", key: "salesAmount", width: 15 },
      { header: "Profit (IDR)", key: "profitAmount", width: 15 },
      { header: "Status", key: "departureStatus", width: 15 },
      { header: "Staff", key: "staff", width: 15 }
    ];

    rows.forEach(r => sheet.addRow(r));
    sheet.getRow(1).font = { bold: true };

    const ts = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Disposition", `attachment; filename="tour_report_${ts}.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportExcel error:", err.message);
    res.status(500).json({ error: "Gagal mengekspor laporan tour." });
  }
};
