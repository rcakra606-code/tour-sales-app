const Database = require("better-sqlite3");
const db = new Database("./data/travel.db");

db.prepare(`CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer TEXT,
  tour_id INTEGER,
  amount REAL,
  date TEXT
)`).run();

exports.getAll = (req, res) => {
  const sales = db.prepare("SELECT * FROM sales").all();
  res.json(sales);
};

exports.create = (req, res) => {
  const { customer, tour_id, amount, date } = req.body;
  db.prepare("INSERT INTO sales (customer,tour_id,amount,date) VALUES (?,?,?,?)").run(customer, tour_id, amount, date);
  res.json({ success: true });
};

exports.update = (req, res) => {
  const { id, customer, tour_id, amount, date } = req.body;
  db.prepare("UPDATE sales SET customer=?, tour_id=?, amount=?, date=? WHERE id=?").run(customer, tour_id, amount, date, id);
  res.json({ success: true });
};

exports.delete = (req, res) => {
  const { id } = req.body;
  db.prepare("DELETE FROM sales WHERE id=?").run(id);
  res.json({ success: true });
};
