// controllers/salesController.js
const db = require("../config/database");

// === GET semua data sales ===
exports.getAllSales = (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM sales ORDER BY id DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === GET satu data sales ===
exports.getSaleById = (req, res) => {
  try {
    const sale = db.prepare("SELECT * FROM sales WHERE id = ?").get(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === POST tambah data sales ===
exports.addSale = (req, res) => {
  try {
    const { transactionDate, invoiceNumber, salesAmount, profitAmount, staff } = req.body;
    if (!invoiceNumber || !salesAmount) {
      return res.status(400).json({ message: "Invoice number and sales amount required" });
    }

    const insert = db.prepare(`
      INSERT INTO sales (transactionDate, invoiceNumber, salesAmount, profitAmount, staff)
      VALUES (?, ?, ?, ?, ?)
    `);
    insert.run(transactionDate, invoiceNumber, salesAmount, profitAmount, staff);

    res.status(201).json({ message: "Sale added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === PUT update data sales ===
exports.updateSale = (req, res) => {
  try {
    const id = req.params.id;
    const { transactionDate, invoiceNumber, salesAmount, profitAmount, staff } = req.body;

    const update = db.prepare(`
      UPDATE sales
      SET transactionDate = ?, invoiceNumber = ?, salesAmount = ?, profitAmount = ?, staff = ?
      WHERE id = ?
    `);
    const result = update.run(transactionDate, invoiceNumber, salesAmount, profitAmount, staff, id);

    if (result.changes === 0) return res.status(404).json({ message: "Sale not found" });
    res.json({ message: "Sale updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === DELETE data sales ===
exports.deleteSale = (req, res) => {
  try {
    const id = req.params.id;
    const del = db.prepare("DELETE FROM sales WHERE id = ?").run(id);
    if (del.changes === 0) return res.status(404).json({ message: "Sale not found" });
    res.json({ message: "Sale deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
