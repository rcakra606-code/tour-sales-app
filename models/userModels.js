// =====================================
// ✅ User Model (SQLite)
// =====================================
const db = require("../config/database");

const User = {
  findByUsername(username, callback) {
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, row) => {
        if (err) {
          console.error("DB error (findByUsername):", err.message);
          return callback(err, null);
        }
        callback(null, row);
      }
    );
  },

  create(username, password, role = "admin", callback) {
    db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, password, role],
      function (err) {
        if (err) {
          console.error("DB error (create user):", err.message);
          return callback(err);
        }
        callback(null, { id: this.lastID });
      }
    );
  },
};

module.exports = User;
