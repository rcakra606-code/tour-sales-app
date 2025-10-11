// =====================================
// ✅ Tours Controller
// =====================================
const db = require("../config/db");

exports.getAllTours = (req, res) => {
  db.all("SELECT * FROM tours ORDER BY date DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
};

exports.createTour = (req, res) => {
  const { name, date, participants, status } = req.body;
  if (!name || !date)
    return res.status(400).json({ message: "Data tour tidak lengkap." });

  db.run(
    "INSERT INTO tours (name, date, participants, status) VALUES (?, ?, ?, ?)",
    [name, date, participants || 0, status || "pending"],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ id: this.lastID, message: "Tour berhasil ditambahkan." });
    }
  );
};
