// controllers/regionsController.js
const db = require("../config/database");

exports.getAll = (req, res) => {
  try {
    const regions = db.prepare("SELECT * FROM regions ORDER BY name ASC").all();
    res.json(regions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Region name required" });

    const exists = db
      .prepare("SELECT id FROM regions WHERE name = ?")
      .get(name);
    if (exists)
      return res.status(409).json({ message: "Region already exists" });

    db.prepare("INSERT INTO regions (name, description) VALUES (?, ?)").run(
      name,
      description || null
    );

    res.status(201).json({ message: "Region added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const exists = db.prepare("SELECT id FROM regions WHERE id = ?").get(id);
    if (!exists) return res.status(404).json({ message: "Region not found" });

    db.prepare("UPDATE regions SET name = ?, description = ? WHERE id = ?").run(
      name,
      description || null,
      id
    );

    res.json({ message: "Region updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM regions WHERE id = ?").run(id);
    res.json({ message: "Region deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
