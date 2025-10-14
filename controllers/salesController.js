const db = require("../config/database");

exports.getAllSales = (req, res) => {
  db.all(`SELECT * FROM sales ORDER BY date DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
};

exports.createSale = (req, res) => {
  const { customer, tourId, amount } = req.body;
  db.run(
    `INSERT INTO sales (customer, tourId, amount, date) VALUES (?, ?, ?, datetime('now'))`,
    [customer, tourId, amount],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ id: this.lastID, customer, tourId, amount });
    }
  );
};
