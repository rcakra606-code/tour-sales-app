const db = require("../config/database");

exports.getAllTours = (req, res) => {
  const tours = db.prepare("SELECT * FROM tours").all();
  res.json({ success: true, tours });
};

exports.getTourById = (req, res) => {
  const tour = db.prepare("SELECT * FROM tours WHERE id=?").get(req.params.id);
  if (!tour) return res.status(404).json({ success: false, message: "Tour tidak ditemukan" });
  res.json({ success: true, tour });
};

exports.createTour = (req, res) => {
  const { title, description, price, date } = req.body;
  if (!title || !description || !price || !date) return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
  db.prepare("INSERT INTO tours (title, description, price, date) VALUES (?, ?, ?, ?)").run(title, description, price, date);
  res.json({ success: true, message: "Tour berhasil ditambahkan" });
};

exports.updateTour = (req, res) => {
  const { title, description, price, date } = req.body;
  db.prepare("UPDATE tours SET title=?, description=?, price=?, date=? WHERE id=?").run(title, description, price, date, req.params.id);
  res.json({ success: true, message: "Tour berhasil diperbarui" });
};

exports.deleteTour = (req, res) => {
  db.prepare("DELETE FROM tours WHERE id=?").run(req.params.id);
  res.json({ success: true, message: "Tour berhasil dihapus" });
};
