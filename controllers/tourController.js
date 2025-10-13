const db = require("../config/database");

module.exports = {
  getTours: (req, res) => {
    try {
      const tours = db.prepare("SELECT * FROM tours").all();
      res.json({ success: true, data: tours });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  createTour: (req, res) => {
    const { title, description, price, date } = req.body;
    if (!title || !description || !price || !date) return res.status(400).json({ message: "Semua field wajib diisi." });
    db.prepare("INSERT INTO tours (title, description, price, date) VALUES (?,?,?,?)").run(title, description, price, date);
    res.json({ success: true, message: "Tour berhasil ditambahkan." });
  }
};
