/**
 * 🌍 REGION CONTROLLER
 */
const db = require("../config/database");

exports.getAll = (req, res) => {
  try {
    const regions = db.prepare("SELECT * FROM regions ORDER BY id DESC").all();
    res.json(regions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const { name, description } = req.body;
    db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)").run(name, description);
    res.json({ message: "Region added successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    db.prepare("UPDATE regions SET name=?, description=? WHERE id=?").run(name, description, id);
    res.json({ message: "Region updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM regions WHERE id=?").run(id);
    res.json({ message: "Region deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
