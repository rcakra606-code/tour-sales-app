// controllers/tourController.js
const db = require("../config/database");

exports.getAllTours = (req, res) => {
  const tours = db.prepare("SELECT * FROM tours").all();
  res.json(tours);
};

exports.getTourById = (req, res) => {
  const tour = db.prepare("SELECT * FROM tours WHERE id = ?").get(req.params.id);
  if (!tour) return res.status(404).json({ message: "Tour tidak ditemukan" });
  res.json(tour);
};

exports.createTour = (req, res) => {
  const { title, description, price, date } = req.body;
  const result = db
    .prepare("INSERT INTO tours (title, description, price, date) VALUES (?, ?, ?, ?)")
    .run(title, description, price, date);

  res.status(201).json({ message: "Tour berhasil ditambahkan", id: result.lastInsertRowid });
};

exports.updateTour = (req, res) => {
  const { title, description, price, date } = req.body;
  const { id } = req.params;

  const result = db
    .prepare("UPDATE tours SET title = ?, description = ?, price = ?, date = ? WHERE id = ?")
    .run(title, description, price, date, id);

  if (result.changes === 0) return res.status(404).json({ message: "Tour tidak ditemukan" });
  res.json({ message: "Tour berhasil diperbarui" });
};

exports.deleteTour = (req, res) => {
  const result = db.prepare("DELETE FROM tours WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: "Tour tidak ditemukan" });
  res.json({ message: "Tour berhasil dihapus" });
};
