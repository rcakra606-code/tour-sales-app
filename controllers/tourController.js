const db = require("../config/database");

exports.getAllTours = (req, res) => {
  db.all(`SELECT * FROM tours ORDER BY date DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
};

exports.createTour = (req, res) => {
  const { title, description, price, date } = req.body;
  db.run(
    `INSERT INTO tours (title, description, price, date) VALUES (?, ?, ?, ?)`,
    [title, description, price, date],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ id: this.lastID, title, description, price, date });
    }
  );
};

exports.deleteTour = (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM tours WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ success: true });
  });
};
