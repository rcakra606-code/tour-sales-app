// controllers/salesController.js
const db = require("../config/database");

exports.getAllSales = (req, res) => {
  try {
    const rows = db
      .prepare(`
        SELECT s.id, s.transactionDate, s.invoiceNumber, s.salesAmount, s.profitAmount,
               u.name as staff
        FROM sales s
        LEFT JOIN users u ON s.user_id = u.id
        ORDER BY s.id DESC
      `)
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSale = (req, res) => {
  try {
    const { transactionDate, invoiceNumber, salesAmount, profitAmount, user_id } = req.body;

    if (!invoiceNumber || !salesAmount)
      return res.status(400).json({ message: "invoiceNumber and salesAmount required" });

    const stmt = db.prepare(`
      INSERT INTO sales (transactionDate, invoiceNumber, salesAmount, profitAmount, user_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(transactionDate || new Date().toISOString().slice(0, 10), invoiceNumber, salesAmount, profitAmount || 0, user_id || req.user?.id);

    res.status(201).json({ message: "Sales record created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSale = (req, res) => {
  try {
    const { id } = req.params;
    const { transactionDate, invoiceNumber, salesAmount, profitAmount } = req.body;

    const existing = db.prepare("SELECT * FROM sales WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ message: "Sales record not found" });

    db.prepare(`
      UPDATE sales
      SET transactionDate=?, invoiceNumber=?, salesAmount=?, profitAmount=?
      WHERE id=?
    `).run(
      transactionDate || existing.transactionDate,
      invoiceNumber || existing.invoiceNumber,
      salesAmount || existing.salesAmount,
      profitAmount || existing.profitAmount,
      id
    );

    res.json({ message: "Sales updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSale = (req, res) => {
  try {
    const { id } = req.params;
    const del = db.prepare("DELETE FROM sales WHERE id = ?").run(id);
    if (del.changes === 0) return res.status(404).json({ message: "Sales record not found" });
    res.json({ message: "Sales deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
