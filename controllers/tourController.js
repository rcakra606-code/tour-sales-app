// controllers/tourController.js
const db = require("../config/database");

// POST /api/tours
exports.create = (req, res) => {
  try {
    const body = req.body;
    // compute sales/profit if not provided
    const salesAmount = body.tourPrice || 0;
    const profitAmount = body.profitAmount ?? Math.round((body.tourPrice || 0) * 0.2);

    const insert = db.prepare(`INSERT INTO tours
      (registrationDate,leadPassenger,allPassengers,paxCount,tourCode,region,departureDate,bookingCode,tourPrice,discountRemarks,paymentProof,documentReceived,visaProcessStart,visaProcessEnd,staff,departureStatus,documentRemarks,salesAmount,profitAmount)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const info = insert.run(
      body.registrationDate, body.leadPassenger, body.allPassengers, body.paxCount || 0,
      body.tourCode, body.region, body.departureDate, body.bookingCode, body.tourPrice || 0,
      body.discountRemarks || '', body.paymentProof || '', body.documentReceived || null,
      body.visaProcessStart || null, body.visaProcessEnd || null,
      body.staff || null, body.departureStatus || 'belum_jalan', body.documentRemarks || null,
      salesAmount, profitAmount
    );
    res.json({ id: info.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/tours
exports.list = (req, res) => {
  try {
    const { staff, region, startDate, endDate, departureStatus } = req.query;
    let sql = "SELECT * FROM tours WHERE 1=1";
    const params = [];
    if (staff && staff !== "all") { sql += " AND staff = ?"; params.push(staff); }
    if (region && region !== "all") { sql += " AND region = ?"; params.push(region); }
    if (departureStatus && departureStatus !== "all") { sql += " AND departureStatus = ?"; params.push(departureStatus); }
    if (startDate) { sql += " AND registrationDate >= ?"; params.push(startDate); }
    if (endDate) { sql += " AND registrationDate <= ?"; params.push(endDate); }
    const rows = db.prepare(sql + " ORDER BY registrationDate DESC").all(...params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
