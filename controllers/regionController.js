// controllers/regionController.js
const db = require("../config/database");

exports.getAll = (req, res) => {
  try {
    const rows = db.prepare("SELECT id, name, description FROM regions ORDER BY name ASC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });
    const exists = db.prepare("SELECT id FROM regions WHERE name = ?").get(name);
    if (exists) return res.status(409).json({ message: "Region exists" });
    db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)").run(name, description || null);
    res.status(201).json({ message: "Region added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });
    db.prepare("UPDATE regions SET name = ?, description = ? WHERE id = ?").run(name, description || null, id);
    res.json({ message: "Region updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    const id = req.params.id;
    db.prepare("DELETE FROM regions WHERE id = ?").run(id);
    res.json({ message: "Region removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
