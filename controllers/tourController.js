// controllers/tourController.js
const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "..", "data", "database.sqlite"));

/**
 * GET /api/tours
 * Ambil semua tour (dengan optional search & pagination)
 */
exports.getTours = (req, res) => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : "%%";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const totalRow = db
      .prepare(
        `SELECT COUNT(*) AS c FROM tours 
         WHERE leadPassenger LIKE ? OR tourCode LIKE ? OR region LIKE ?`
      )
      .get(search, search, search);
    const total = totalRow.c || 0;
    const totalPages = Math.ceil(total / limit);

    const tours = db
      .prepare(
        `SELECT * FROM tours 
         WHERE leadPassenger LIKE ? OR tourCode LIKE ? OR region LIKE ? 
         ORDER BY registrationDate DESC 
         LIMIT ? OFFSET ?`
      )
      .all(search, search, search, limit, offset);

    res.json({ data: tours, total, page, totalPages });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data tour." });
  }
};

/**
 * POST /api/tours
 * Tambah tour baru
 */
exports.createTour = (req, res) => {
  try {
    const data = req.body;
    if (!data.registrationDate || !data.leadPassenger)
      return res.status(400).json({ error: "Tanggal & Lead Passenger wajib diisi." });

    const stmt = db.prepare(`
      INSERT INTO tours (
        registrationDate, leadPassenger, allPassengers, paxCount, tourCode, region,
        departureDate, bookingCode, tourPrice, discountRemarks, paymentProof, 
        documentReceived, visaProcessStart, visaProcessEnd, documentRemarks, staff,
        salesAmount, profitAmount, departureStatus
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);

    stmt.run(
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
    res.status(500).json({ error: "Gagal menambahkan tour." });
  }
};

/**
 * DELETE /api/tours/:id
 * Hapus tour
 */
exports.deleteTour = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM tours WHERE id = ?").run(id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus tour." });
  }
};

/**
 * GET /api/tours/summary
 * Statistik untuk dashboard (total, region, bulanan)
 */
exports.getTourSummary = (req, res) => {
  try {
    const totalTours = db.prepare("SELECT COUNT(*) AS c FROM tours").get().c || 0;
    const totalPax = db.prepare("SELECT SUM(paxCount) AS t FROM tours").get().t || 0;
    const totalValue = db.prepare("SELECT SUM(tourPrice) AS t FROM tours").get().t || 0;

    // Statistik region
    const regionStats = db.prepare(`
      SELECT region, COUNT(*) AS total 
      FROM tours WHERE region != '' 
      GROUP BY region ORDER BY total DESC
    `).all();

    // Statistik bulanan (registrationDate)
    const monthStats = db.prepare(`
      SELECT SUBSTR(registrationDate, 1, 7) AS month, COUNT(*) AS total 
      FROM tours GROUP BY month ORDER BY month ASC
    `).all();

    res.json({
      totalTours,
      totalPax,
      totalValue,
      regionStats,
      monthStats
    });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil ringkasan tour." });
  }
};
