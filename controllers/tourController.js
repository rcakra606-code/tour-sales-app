// controllers/tourController.js
const path = require("path");
const Database = require("better-sqlite3");
const ExcelJS = require("exceljs");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/* ===========================================================
   📦 FUNGSI: GET TOURS (list, search, pagination)
=========================================================== */
exports.getTours = (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let where = "WHERE (leadPassenger LIKE ? OR tourCode LIKE ? OR region LIKE ?)";
    const params = [search, search, search];
    if (startDate && endDate) {
      where += " AND registrationDate BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const totalRow = db
      .prepare(`SELECT COUNT(*) AS c FROM tours ${where}`)
      .get(...params);
    const total = totalRow.c || 0;
    const totalPages = Math.ceil(total / limit);

    const tours = db
      .prepare(
        `SELECT * FROM tours ${where}
         ORDER BY registrationDate DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset);

    res.json({ data: tours, total, page, totalPages });
  } catch (err) {
    console.error("getTours error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data tour." });
  }
};

/* ===========================================================
   ➕ FUNGSI: CREATE TOUR
=========================================================== */
exports.createTour = (req, res) => {
  try {
    const data = req.body;
    if (!data.registrationDate || !data.leadPassenger)
      return res
        .status(400)
        .json({ error: "Tanggal & Lead Passenger wajib diisi." });

    db.prepare(
      `INSERT INTO tours (
        registrationDate, leadPassenger, allPassengers, paxCount, tourCode, region,
        departureDate, bookingCode, tourPrice, discountRemarks, paymentProof,
        documentReceived, visaProcessStart, visaProcessEnd, documentRemarks, staff,
        salesAmount, profitAmount, departureStatus
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      data.registrationDate,
      data.leadPassenger,
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
      data.staff || "",
      data.salesAmount || 0,
      data.profitAmount || 0,
      data.departureStatus || "PENDING"
    );

    res.json({ ok: true, message: "Tour berhasil ditambahkan." });
  } catch (err) {
    console.error("createTour error:", err.message);
    res.status(500).json({ error: "Gagal menambahkan tour." });
  }
};

/* ===========================================================
   🗑️ FUNGSI: DELETE TOUR
=========================================================== */
exports.deleteTour = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM tours WHERE id = ?").run(id);
    res.json({ ok: true });
  } catch (err) {
    console.error("deleteTour error:", err.message);
    res.status(500).json({ error: "Gagal menghapus tour." });
  }
};

/* ===========================================================
   📊 FUNGSI: SUMMARY UNTUK DASHBOARD
=========================================================== */
exports.getTourSummary = (req, res) => {
  try {
    const totalTours = db.prepare("SELECT COUNT(*) AS c FROM tours").get().c || 0;
    const totalPax = db.prepare("SELECT SUM(paxCount) AS t FROM tours").get().t || 0;
    const totalValue = db.prepare("SELECT SUM(tourPrice) AS t FROM tours").get().t || 0;

    const regionStats = db
      .prepare(
        `SELECT region, COUNT(*) AS total
         FROM tours WHERE region != ''
         GROUP BY region ORDER BY total DESC`
      )
      .all();

    const monthStats = db
      .prepare(
        `SELECT SUBSTR(registrationDate, 1, 7) AS month, COUNT(*) AS total
         FROM tours GROUP BY month ORDER BY month ASC`
      )
      .all();

    res.json({ totalTours, totalPax, totalValue, regionStats, monthStats });
  } catch (err) {
    console.error("getTourSummary error:", err.message);
    res.status(500).json({ error: "Gagal mengambil ringkasan tour." });
  }
};

/* ===========================================================
   📤 FUNGSI: EXPORT KE EXCEL
=========================================================== */
exports.exportToursExcel = async (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    let where = "WHERE (leadPassenger LIKE ? OR tourCode LIKE ? OR region LIKE ?)";
    const params = [search, search, search];
    if (startDate && endDate) {
      where += " AND registrationDate BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const rows = db
      .prepare(
        `SELECT id, registrationDate, leadPassenger, paxCount, tourCode, region, departureDate, tourPrice, staff
         FROM tours ${where} ORDER BY registrationDate DESC`
      )
      .all(...params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Tours Export");

    sheet.columns = [
      { header: "ID", key: "id", width: 8 },
      { header: "Registration Date", key: "registrationDate", width: 15 },
      { header: "Lead Passenger", key: "leadPassenger", width: 22 },
      { header: "Pax Count", key: "paxCount", width: 10 },
      { header: "Tour Code", key: "tourCode", width: 14 },
      { header: "Region", key: "region", width: 14 },
      { header: "Departure Date", key: "departureDate", width: 15 },
      { header: "Tour Price (IDR)", key: "tourPrice", width: 16 },
      { header: "Staff", key: "staff", width: 16 }
    ];

    rows.forEach(r => {
      sheet.addRow(r);
    });

    // Header style
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: "center" };
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    const ts = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
    const filename = `tours_export_${ts}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportToursExcel error:", err.message);
    res.status(500).json({ error: "Gagal mengekspor ke Excel." });
  }
};

/* ===========================================================
   📤 FUNGSI: EXPORT KE CSV
=========================================================== */
exports.exportToursCSV = (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;

    let where = "WHERE (leadPassenger LIKE ? OR tourCode LIKE ? OR region LIKE ?)";
    const params = [search, search, search];
    if (startDate && endDate) {
      where += " AND registrationDate BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const rows = db
      .prepare(
        `SELECT id, registrationDate, leadPassenger, paxCount, tourCode, region, departureDate, tourPrice, staff
         FROM tours ${where} ORDER BY registrationDate DESC`
      )
      .all(...params);

    const header = [
      "ID",
      "Registration Date",
      "Lead Passenger",
      "Pax Count",
      "Tour Code",
      "Region",
      "Departure Date",
      "Tour Price",
      "Staff"
    ];

    const escapeCsv = v => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines = [header.join(",")];
    rows.forEach(r => {
      lines.push(
        [
          r.id,
          r.registrationDate,
          r.leadPassenger,
          r.paxCount,
          r.tourCode,
          r.region,
          r.departureDate,
          r.tourPrice,
          r.staff
        ]
          .map(escapeCsv)
          .join(",")
      );
    });

    const csv = lines.join("\n");
    const ts = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
    const filename = `tours_export_${ts}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error("exportToursCSV error:", err.message);
    res.status(500).json({ error: "Gagal mengekspor ke CSV." });
  }
};
