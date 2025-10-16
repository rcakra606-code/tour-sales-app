// controllers/salesController.js
const db = require("../config/database");

exports.getAllSales = (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM sales ORDER BY id DESC");
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSale = (req, res) => {
  try {
    const {
      transactionDate,
      invoiceNumber,
      salesAmount,
      profitAmount,
      staff
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO sales (transactionDate, invoiceNumber, salesAmount, profitAmount, staff)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      transactionDate || new Date().toISOString().slice(0,10),
      invoiceNumber,
      salesAmount || 0,
      profitAmount || 0,
      staff
    );

    res.status(201).json({ message: "Sale record created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
