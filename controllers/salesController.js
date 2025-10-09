const pool = require('../config/database');

const getAllSales = async (req,res) => {
  try {
    const r = await pool.query('SELECT * FROM sales_data ORDER BY created_at DESC');
    res.json({ sales: r.rows });
  } catch (e) { console.error(e); res.status(500).json({ error:'Internal error' }); }
};

const createSales = async (req,res) => {
  try {
    const f = req.body;
    const r = await pool.query('INSERT INTO sales_data (transaction_date,invoice_number,sales_amount,profit_amount,discount_amount,discount_remarks,staff_name,input_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [f.transaction_date,f.invoice_number,f.sales_amount,f.profit_amount,f.discount_amount,f.discount_remarks,f.staff_name,req.user.name]);
    res.status(201).json({ sales: r.rows[0] });
  } catch (e) { console.error(e); res.status(500).json({ error:'Internal error' }); }
};

module.exports = { getAllSales, createSales };
