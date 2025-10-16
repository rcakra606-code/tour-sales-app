// controllers/tourController.js
const db = require("../config/database");

// === GET all tours ===
exports.getAllTours = (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM tours ORDER BY id DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === GET single tour ===
exports.getTourById = (req, res) => {
  try {
    const tour = db.prepare("SELECT * FROM tours WHERE id = ?").get(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === POST new tour ===
exports.addTour = (req, res) => {
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

    const insert = db.prepare(`
      INSERT INTO tours (registrationDate, leadPassenger, tourCode, region, paxCount, staff, tourPrice, departureStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(registrationDate, leadPassenger, tourCode, region, paxCount, staff, tourPrice, departureStatus);
    res.status(201).json({ message: "Tour added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === UPDATE tour ===
exports.updateTour = (req, res) => {
  try {
    const id = req.params.id;
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

    const update = db.prepare(`
      UPDATE tours SET
        registrationDate=?, leadPassenger=?, tourCode=?, region=?, paxCount=?, staff=?, tourPrice=?, departureStatus=?
      WHERE id=?
    `);

    const result = update.run(registrationDate, leadPassenger, tourCode, region, paxCount, staff, tourPrice, departureStatus, id);

    if (result.changes === 0) return res.status(404).json({ message: "Tour not found" });
    res.json({ message: "Tour updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === DELETE tour ===
exports.deleteTour = (req, res) => {
  try {
    const id = req.params.id;
    const del = db.prepare("DELETE FROM tours WHERE id = ?").run(id);
    if (del.changes === 0) return res.status(404).json({ message: "Tour not found" });
    res.json({ message: "Tour deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
