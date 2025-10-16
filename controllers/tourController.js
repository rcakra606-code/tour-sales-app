// controllers/toursController.js
const db = require("../config/database");

// === GET semua tour ===
exports.getAllTours = (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM tours ORDER BY id DESC");
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === POST buat tour baru ===
exports.createTour = (req, res) => {
  try {
    const {
      registrationDate,
      leadPassenger,
      tourCode,
      region,
      paxCount,
      staff,
      tourPrice,
      departureStatus
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO tours (registrationDate, leadPassenger, tourCode, region, paxCount, staff, tourPrice, departureStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      registrationDate || new Date().toISOString().slice(0,10),
      leadPassenger,
      tourCode,
      region,
      paxCount || 0,
      staff,
      tourPrice || 0,
      departureStatus || "Pending"
    );

    res.status(201).json({ message: "Tour created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
