const db = require("../config/database");

module.exports = {
  getSales: (req, res) => {
    try {
      const sales = db.prepare("SELECT * FROM sales").all();
      res.json({ success: true, data: sales });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  createSale: (req, res) => {
    const { tourId, amount, date } = req.body;
    if (!tourId || !amount || !date) return res.status(400).json({ message: "Semua field wajib diisi." });
    db.prepare("INSERT INTO sales (tourId, amount, date) VALUES (?,?,?)").run(tourId, amount, date);
    res.json({ success: true, message: "Data sales berhasil ditambahkan." });
  }
};
