const pool = require('../config/database');

const getAllTours = async (req,res) => {
  try {
    const q = 'SELECT * FROM tour_data ORDER BY created_at DESC';
    const r = await pool.query(q);
    res.json({ tours: r.rows });
  } catch (e) { console.error(e); res.status(500).json({ error:'Internal error' }); }
};

const createTour = async (req,res) => {
  try {
    const fields = req.body;
    const r = await pool.query(`
      INSERT INTO tour_data (reg_date,lead_passenger,all_passengers,pax_count,tour_code,region,departure_date,booking_code,price,departure_status,input_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`, [
      fields.reg_date, fields.lead_passenger, fields.all_passengers, fields.pax_count, fields.tour_code, fields.region, fields.departure_date, fields.booking_code, fields.price, fields.departure_status || 'belum_jalan', req.user.name
    ]);
    res.status(201).json({ tour: r.rows[0] });
  } catch (e) { console.error(e); res.status(500).json({ error:'Internal error' }); }
};

module.exports = { getAllTours, createTour };
