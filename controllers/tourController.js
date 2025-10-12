// controllers/tourController.js
const Tour = require('../models/tourModel');

exports.getAll = (req, res) => {
  try {
    const tours = Tour.all();
    res.json({ success: true, tours });
  } catch (e) {
    console.error('Error getAll tours:', e);
    res.status(500).json({ success: false, message: 'Gagal mengambil data tours.' });
  }
};

exports.create = (req, res) => {
  try {
    const payload = req.body;
    const created = Tour.create(payload);
    res.status(201).json({ success: true, tour: created });
  } catch (e) {
    console.error('Error create tour:', e);
    res.status(500).json({ success: false, message: 'Gagal membuat tour.' });
  }
};

exports.update = (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, message: 'ID tidak valid.' });

    const existing = Tour.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Tour tidak ditemukan.' });

    const updated = Tour.update(id, req.body);
    res.json({ success: true, tour: updated });
  } catch (e) {
    console.error('Error update tour:', e);
    res.status(500).json({ success: false, message: 'Gagal update tour.' });
  }
};

exports.remove = (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ success: false, message: 'ID tidak valid.' });

    const ok = Tour.remove(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Tour tidak ditemukan.' });

    res.json({ success: true, message: 'Tour dihapus.' });
  } catch (e) {
    console.error('Error delete tour:', e);
    res.status(500).json({ success: false, message: 'Gagal menghapus tour.' });
  }
};
