const db = require("../config/database");

exports.listSales = (req, res) => {
  const sales = db.prepare("SELECT * FROM sales").all();
  res.json({ success: true, sales });
};

exports.getSaleById = (req, res) => {
  const sale = db.prepare("SELECT * FROM sales WHERE id=?").get(req.params.id);
  if (!sale) return res.status(404).json({ success: false, message: "Data sales tidak ditemukan" });
  res.json({ success: true, sale });
};

exports.createSale = (req, res) => {
  const { customer, tourId, amount } = req.body;
  if (!customer || !tourId || !amount) return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
  db.prepare("INSERT INTO sales (customer, tourId, amount) VALUES (?, ?, ?)").run(customer, tourId, amount);
  res.json({ success: true, message: "Sales berhasil ditambahkan" });
};

exports.updateSale = (req, res) => {
  const { customer, tourId, amount } = req.body;
  db.prepare("UPDATE sales SET customer=?, tourId=?, amount=? WHERE id=?").run(customer, tourId, amount, req.params.id);
  res.json({ success: true, message: "Sales berhasil diperbarui" });
};

exports.deleteSale = (req, res) => {
  db.prepare("DELETE FROM sales WHERE id=?").run(req.params.id);
  res.json({ success: true, message: "Sales berhasil dihapus" });
};
