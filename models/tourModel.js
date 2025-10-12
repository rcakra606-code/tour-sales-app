// models/tourModel.js
const db = require("../config/database");

const Tour = {
  getAll(callback) {
    db.all("SELECT * FROM tours ORDER BY id DESC", [], (err, rows) => {
      callback(err, rows);
    });
  },

  getById(id, callback) {
    db.get("SELECT * FROM tours WHERE id = ?", [id], (err, row) => {
      callback(err, row);
    });
  },

  create(data, callback) {
    const { title, description, price, date } = data;
    db.run(
      "INSERT INTO tours (title, description, price, date) VALUES (?, ?, ?, ?)",
      [title, description, price, date],
      function (err) {
        callback(err, { id: this?.lastID });
      }
    );
  },

  update(id, data, callback) {
    const { title, description, price, date } = data;
    db.run(
      "UPDATE tours SET title = ?, description = ?, price = ?, date = ? WHERE id = ?",
      [title, description, price, date, id],
      function (err) {
        callback(err, { changes: this?.changes });
      }
    );
  },

  delete(id, callback) {
    db.run("DELETE FROM tours WHERE id = ?", [id], function (err) {
      callback(err, { changes: this?.changes });
    });
  },
};

module.exports = Tour;
