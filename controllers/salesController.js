// =====================================
// ✅ Sales Controller
// =====================================
const db = require("../config/db");

exports.getAllSales = (req, res) => {
  db.all("SELECT * FROM sales ORDER BY date DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
};

exports.createSales = (req, res) => {
  const { amount, date, description } = req.body;
  if (!amount || !date)
    return res.status(400).json({ message: "Data sales tidak lengkap." });

  db.run(
    "INSERT INTO sales (amount, date, description) VALUES (?, ?, ?)",
    [amount, date, description || ""],
    function (err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ id: this.lastID, message: "Sales berhasil ditambahkan." });
    }
  );
};
