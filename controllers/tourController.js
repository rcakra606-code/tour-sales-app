// controllers/toursController.js
const db = require("../config/database");

// === GET all tours ===
exports.getAllTours = (req, res) => {
  try {
    const rows = db
      .prepare(`
        SELECT t.id,
               t.registrationDate,
               t.leadPassenger,
               t.tourCode,
               t.region,
               t.paxCount,
               t.tourPrice,
               t.departureStatus,
               u.name AS staff
        FROM tours t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.id DESC
      `)
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === CREATE new tour ===
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
      departureStatus,
    } = req.body;

    if (!leadPassenger || !tourCode)
      return res.status(400).json({ message: "leadPassenger and tourCode required" });

    // Cari ID staff jika dikirim sebagai nama
    let userId = null;
    if (staff) {
      const user = db.prepare("SELECT id FROM users WHERE name = ? OR username = ?").get(staff, staff);
      if (user) userId = user.id;
    }

    db.prepare(`
      INSERT INTO tours
      (registrationDate, leadPassenger, tourCode, region, paxCount, tourPrice, departureStatus, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      registrationDate || new Date().toISOString().slice(0, 10),
      leadPassenger,
      tourCode,
      region || "Unspecified",
      paxCount || 0,
      tourPrice || 0,
      departureStatus || "Pending",
      userId || req.user?.id || null
    );

    res.status(201).json({ message: "Tour created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === UPDATE tour ===
exports.updateTour = (req, res) => {
  try {
    const { id } = req.params;
    const {
      registrationDate,
      leadPassenger,
      tourCode,
      region,
      paxCount,
      tourPrice,
      departureStatus,
    } = req.body;

    const tour = db.prepare("SELECT * FROM tours WHERE id = ?").get(id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    db.prepare(`
      UPDATE tours
      SET registrationDate=?, leadPassenger=?, tourCode=?, region=?, paxCount=?, tourPrice=?, departureStatus=?
      WHERE id=?
    `).run(
      registrationDate || tour.registrationDate,
      leadPassenger || tour.leadPassenger,
      tourCode || tour.tourCode,
      region || tour.region,
      paxCount || tour.paxCount,
      tourPrice || tour.tourPrice,
      departureStatus || tour.departureStatus,
      id
    );

    res.json({ message: "Tour updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === DELETE tour ===
exports.deleteTour = (req, res) => {
  try {
    const { id } = req.params;
    const del = db.prepare("DELETE FROM tours WHERE id = ?").run(id);
    if (del.changes === 0) return res.status(404).json({ message: "Tour not found" });
    res.json({ message: "Tour deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
