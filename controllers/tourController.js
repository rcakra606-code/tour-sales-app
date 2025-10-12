// controllers/tourController.js
const Tour = require("../models/tourModel");

exports.getAllTours = (req, res) => {
  Tour.getAll((err, rows) => {
    if (err) return res.status(500).json({ success: false, message: "Gagal memuat tour" });
    res.json({ success: true, tours: rows });
  });
};

exports.getTourById = (req, res) => {
  const { id } = req.params;
  Tour.getById(id, (err, row) => {
    if (err) return res.status(500).json({ success: false, message: "Gagal memuat tour" });
    if (!row) return res.status(404).json({ success: false, message: "Tour tidak ditemukan" });
    res.json({ success: true, tour: row });
  });
};

exports.createTour = (req, res) => {
  const data = req.body;
  if (!data.title || !data.price)
    return res.status(400).json({ success: false, message: "Judul dan harga wajib diisi" });

  Tour.create(data, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Gagal menambah tour" });
    res.json({ success: true, message: "Tour berhasil ditambahkan", id: result.id });
  });
};

exports.updateTour = (req, res) => {
  const { id } = req.params;
  const data = req.body;
  Tour.update(id, data, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Gagal memperbarui tour" });
    res.json({ success: true, message: "Tour berhasil diperbarui", changes: result.changes });
  });
};

exports.deleteTour = (req, res) => {
  const { id } = req.params;
  Tour.delete(id, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Gagal menghapus tour" });
    res.json({ success: true, message: "Tour berhasil dihapus", changes: result.changes });
  });
};
