const db = require("../config/database");

module.exports = {
  getDashboard: (req, res) => {
    try {
      const tours = db.prepare("SELECT * FROM tours").all();
      const sales = db.prepare("SELECT * FROM sales").all();
      res.json({ success: true, data: { tours, sales } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
