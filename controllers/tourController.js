// controllers/toursController.js
const db = require("../config/database");

// GET all tours
exports.getAll = (req, res) => {
  db.all("SELECT * FROM tours ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil data tours." });
    res.json(rows);
  });
};

// CREATE new tour
exports.create = (req, res) => {
  const { name, destination, price, description } = req.body;
  if (!name || !destination || !price) {
    return res.status(400).json({ message: "Nama, destinasi, dan harga wajib diisi." });
  }

  db.run(
    "INSERT INTO tours (name, destination, price, description) VALUES (?, ?, ?, ?)",
    [name, destination, price, description || ""],
    function (err) {
      if (err) return res.status(500).json({ message: "Gagal menambah data tour." });
      res.json({ success: true, id: this.lastID });
    }
  );
};

// UPDATE tour
exports.update = (req, res) => {
  const { id } = req.params;
  const { name, destination, price, description } = req.body;

  db.run(
    "UPDATE tours SET name = ?, destination = ?, price = ?, description = ? WHERE id = ?",
    [name, destination, price, description, id],
    function (err) {
      if (err) return res.status(500).json({ message: "Gagal memperbarui tour." });
      res.json({ success: true, changes: this.changes });
    }
  );
};

// DELETE tour
exports.remove = (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tours WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ message: "Gagal menghapus tour." });
    res.json({ success: true, deleted: this.changes });
  });
};
