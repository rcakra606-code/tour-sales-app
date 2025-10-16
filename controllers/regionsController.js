// controllers/regionsController.js
const db = require("../config/database");

// === GET semua region ===
exports.getAllRegions = (req, res) => {
  try {
    const regions = db.prepare("SELECT * FROM regions ORDER BY name ASC").all();
    res.json(regions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === Tambah region baru ===
exports.addRegion = (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name) return res.status(400).json({ message: "Region name is required" });

    const exists = db.prepare("SELECT id FROM regions WHERE name = ?").get(name);
    if (exists) return res.status(409).json({ message: "Region already exists" });

    const insert = db.prepare("INSERT INTO regions (name, code, description) VALUES (?, ?, ?)");
    insert.run(name, code || null, description || null);

    res.status(201).json({ message: "Region added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === Update region ===
exports.updateRegion = (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const region = db.prepare("SELECT * FROM regions WHERE id = ?").get(id);
    if (!region) return res.status(404).json({ message: "Region not found" });

    const update = db.prepare(`
      UPDATE regions SET name = ?, code = ?, description = ? WHERE id = ?
    `);
    update.run(name || region.name, code || region.code, description || region.description, id);

    res.json({ message: "Region updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === Hapus region ===
exports.deleteRegion = (req, res) => {
  try {
    const { id } = req.params;
    const del = db.prepare("DELETE FROM regions WHERE id = ?").run(id);
    if (del.changes === 0) return res.status(404).json({ message: "Region not found" });
    res.json({ message: "Region deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
