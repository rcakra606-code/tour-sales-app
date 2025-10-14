// controllers/salesController.js
const db = require("../config/database");

// POST /api/sales
exports.create = (req, res) => {
  try {
    const { transactionDate, invoiceNumber, salesAmount, profitAmount, discountAmount, discountRemarks, staff } = req.body;
    const insert = db.prepare(`INSERT INTO sales (transactionDate,invoiceNumber,salesAmount,profitAmount,discountAmount,discountRemarks,staff)
      VALUES (?,?,?,?,?,?,?)`);
    const info = insert.run(transactionDate, invoiceNumber, salesAmount || 0, profitAmount || 0, discountAmount || 0, discountRemarks || '', staff || null);
    res.json({ id: info.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/sales (with optional query filters)
exports.list = (req, res) => {
  try {
    const { staff, startDate, endDate } = req.query;
    let sql = "SELECT * FROM sales WHERE 1=1";
    const params = [];
    if (staff && staff !== "all") { sql += " AND staff = ?"; params.push(staff); }
    if (startDate) { sql += " AND transactionDate >= ?"; params.push(startDate); }
    if (endDate) { sql += " AND transactionDate <= ?"; params.push(endDate); }
    const rows = db.prepare(sql + " ORDER BY transactionDate DESC").all(...params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/sales/targets
exports.targets = (req, res) => {
  try {
    const rows = db.prepare("SELECT staff, salesTarget, profitTarget FROM sales_targets").all();
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/sales/targets (upsert)
exports.setTarget = (req, res) => {
  try {
    const { staff, salesTarget, profitTarget } = req.body;
    const exists = db.prepare("SELECT id FROM sales_targets WHERE staff = ?").get(staff);
    if (exists) {
      db.prepare("UPDATE sales_targets SET salesTarget = ?, profitTarget = ? WHERE staff = ?").run(salesTarget, profitTarget, staff);
      return res.json({ message: "updated" });
    } else {
      db.prepare("INSERT INTO sales_targets (staff, salesTarget, profitTarget) VALUES (?,?,?)").run(staff, salesTarget, profitTarget);
      return res.json({ message: "created" });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
};
