// models/tourModel.js
const db = require('../config/database'); // expects better-sqlite3 instance

const Tour = {
  all() {
    const stmt = db.prepare('SELECT * FROM tours ORDER BY id DESC');
    return stmt.all();
  },

  findById(id) {
    const stmt = db.prepare('SELECT * FROM tours WHERE id = ?');
    return stmt.get(id);
  },

  create(payload) {
    const stmt = db.prepare(
      `INSERT INTO tours 
       (title, description, price, date, lead_passenger, all_passengers, pax_count, tour_code, region, departure_date, booking_code, price, departure_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    // Some fields might be missing in older schema; be defensive
    const values = [
      payload.title || null,
      payload.description || null,
      payload.price || 0,
      payload.date || null,
      payload.lead_passenger || null,
      payload.all_passengers || null,
      payload.pax_count || 0,
      payload.tour_code || null,
      payload.region || null,
      payload.departure_date || null,
      payload.booking_code || null,
      payload.price || 0,
      payload.departure_status || 'belum_jalan'
    ];

    const info = stmt.run(values);
    return this.findById(info.lastInsertRowid);
  },

  update(id, payload) {
    const stmt = db.prepare(
      `UPDATE tours SET
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         price = COALESCE(?, price),
         date = COALESCE(?, date),
         lead_passenger = COALESCE(?, lead_passenger),
         all_passengers = COALESCE(?, all_passengers),
         pax_count = COALESCE(?, pax_count),
         tour_code = COALESCE(?, tour_code),
         region = COALESCE(?, region),
         departure_date = COALESCE(?, departure_date),
         booking_code = COALESCE(?, booking_code),
         departure_status = COALESCE(?, departure_status)
       WHERE id = ?`
    );

    const params = [
      payload.title || null,
      payload.description || null,
      payload.price || null,
      payload.date || null,
      payload.lead_passenger || null,
      payload.all_passengers || null,
      payload.pax_count || null,
      payload.tour_code || null,
      payload.region || null,
      payload.departure_date || null,
      payload.booking_code || null,
      payload.departure_status || null,
      id
    ];

    const info = stmt.run(params);
    return this.findById(id);
  },

  remove(id) {
    const stmt = db.prepare('DELETE FROM tours WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }
};

module.exports = Tour;
