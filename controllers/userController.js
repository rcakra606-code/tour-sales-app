// controllers/usersController.js
const db = require("../config/database");

exports.getAllUsers = (req, res) => {
  try {
    const stmt = db.prepare("SELECT id, name, username, type FROM users ORDER BY id DESC");
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
