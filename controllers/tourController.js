const Database = require("better-sqlite3");
const db = new Database("./data/travel.db");

// Create table jika belum ada
db.prepare(`CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  price REAL,
  date TEXT
)`).run();

exports.getAll = (req, res) => {
  const tours = db.prepare("SELECT * FROM tours").all();
  res.json(tours);
};

exports.create = (req, res) => {
  const { title, description, price, date } = req.body;
  if (!title) return res.status(400).json({ message: "Judul wajib diisi" });
  db.prepare("INSERT INTO tours (title,description,price,date) VALUES (?,?,?,?)").run(title, description, price, date);
  res.json({ success: true, message: "Tour berhasil ditambahkan" });
};

exports.update = (req, res) => {
  const { id, title, description, price, date } = req.body;
  db.prepare("UPDATE tours SET title=?, description=?, price=?, date=? WHERE id=?").run(title, description, price, date, id);
  res.json({ success: true, message: "Tour berhasil diperbarui" });
};

exports.delete = (req, res) => {
  const { id } = req.body;
  db.prepare("DELETE FROM tours WHERE id=?").run(id);
  res.json({ success: true, message: "Tour berhasil dihapus" });
};
