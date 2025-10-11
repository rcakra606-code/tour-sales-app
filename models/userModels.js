// =====================================
// ✅ User Model
// =====================================
const db = require("../config/db");

const User = {
  findByUsername: (username, callback) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], callback);
  },

  create: (username, password, role, callback) => {
    db.run(
      `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
      [username, password, role || "staff"],
      callback
    );
  },

  getAll: (callback) => {
    db.all(`SELECT id, username, role, created_at FROM users`, callback);
  },
};

module.exports = User;
