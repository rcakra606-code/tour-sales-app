const express = require("express");
const router = express.Router();
const { getDB } = require("../db");
const auth = require("../middleware/auth");
const { logAction } = require("../middleware/log");

router.use(auth);

router.get("/", (req, res) => {
  const db = getDB();
  const data = db.prepare("SELECT * FROM tours ORDER BY id DESC").all();
  res.json(data);
});

router.post("/", (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { registration_date, tour_code, lead_passenger, pax_count, region, tour_price } = req.body;

    db.prepare(`
      INSERT INTO tours (registration_date, tour_code, lead_passenger, pax_count, region, tour_price, staff_username)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(registration_date, tour_code, lead_passenger, pax_count, region, tour_price, user.username);

    logAction(user, "Menambahkan Tour Baru", tour_code);
    res.json({ message: "Tour berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
