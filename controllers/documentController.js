// controllers/documentsController.js
const db = require("../config/database");

// === GET all documents ===
exports.getAllDocuments = (req, res) => {
  try {
    const rows = db
      .prepare(`
        SELECT d.id, d.docNumber, d.tourCode, d.sentDate, d.status, u.name AS staff
        FROM documents d
        LEFT JOIN users u ON d.user_id = u.id
        ORDER BY d.id DESC
      `)
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === CREATE document ===
exports.createDocument = (req, res) => {
  try {
    const { docNumber, tourCode, sentDate, status, staff } = req.body;

    if (!docNumber || !tourCode)
      return res.status(400).json({ message: "docNumber and tourCode required" });

    let userId = null;
    if (staff) {
      const user = db.prepare("SELECT id FROM users WHERE name = ? OR username = ?").get(staff, staff);
      if (user) userId = user.id;
    }

    db.prepare(`
      INSERT INTO documents (docNumber, tourCode, sentDate, status, user_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      docNumber,
      tourCode,
      sentDate || new Date().toISOString().slice(0, 10),
      status || "Sent",
      userId || req.user?.id || null
    );

    res.status(201).json({ message: "Document created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === UPDATE document ===
exports.updateDocument = (req, res) => {
  try {
    const { id } = req.params;
    const { docNumber, tourCode, sentDate, status } = req.body;

    const existing = db.prepare("SELECT * FROM documents WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ message: "Document not found" });

    db.prepare(`
      UPDATE documents
      SET docNumber=?, tourCode=?, sentDate=?, status=?
      WHERE id=?
    `).run(
      docNumber || existing.docNumber,
      tourCode || existing.tourCode,
      sentDate || existing.sentDate,
      status || existing.status,
      id
    );

    res.json({ message: "Document updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === DELETE document ===
exports.deleteDocument = (req, res) => {
  try {
    const { id } = req.params;
    const del = db.prepare("DELETE FROM documents WHERE id = ?").run(id);
    if (del.changes === 0) return res.status(404).json({ message: "Document not found" });
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
