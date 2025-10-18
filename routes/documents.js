/**
 * ==========================================================
 * routes/documents.js — Travel Dashboard Enterprise v3.3 Final
 * ==========================================================
 * ✅ CRUD Document Management
 * ✅ Role-based Access (super / semi / basic)
 * ✅ Logging Otomatis
 * ✅ Sesuai dengan tabel 'documents' terbaru:
 *    - receive_date
 *    - guest_name
 *    - booking_code
 *    - tour_code
 *    - document_remarks
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const { getDB } = require("../db");
const auth = require("../middleware/auth");
const { logAction } = require("../middleware/log");

router.use(auth);

// Middleware role check
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.type))
      return res.status(403).json({ error: "Akses ditolak" });
    next();
  };
}

/* ==========================================================
   GET: Semua dokumen
   ========================================================== */
router.get("/", (req, res) => {
  try {
    const db = getDB();
    const docs = db.prepare("SELECT * FROM documents ORDER BY id DESC").all();
    res.json(docs);
  } catch (err) {
    console.error("Error loading documents:", err);
    res.status(500).json({ error: "Gagal memuat data dokumen" });
  }
});

/* ==========================================================
   GET: Dokumen berdasarkan ID
   ========================================================== */
router.get("/:id", (req, res) => {
  try {
    const db = getDB();
    const doc = db.prepare("SELECT * FROM documents WHERE id=?").get(req.params.id);
    if (!doc) return res.status(404).json({ error: "Dokumen tidak ditemukan" });
    res.json(doc);
  } catch (err) {
    console.error("Error get document:", err);
    res.status(500).json({ error: "Gagal memuat dokumen" });
  }
});

/* ==========================================================
   POST: Tambah Dokumen Baru
   ========================================================== */
router.post("/", requireRole("super", "semi"), (req, res) => {
  try {
    const db = getDB();
    const u = req.user;
    const d = req.body;

    db.prepare(`
      INSERT INTO documents (receive_date, guest_name, booking_code, tour_code, document_remarks, staff)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      d.receive_date || "",
      d.guest_name || "",
      d.booking_code || "",
      d.tour_code || "",
      d.document_remarks || "",
      u.username || ""
    );

    logAction(u, "Menambahkan Dokumen", d.booking_code || d.guest_name);
    res.json({ message: "Dokumen berhasil ditambahkan" });
  } catch (err) {
    console.error("Error adding document:", err);
    res.status(500).json({ error: "Gagal menambahkan dokumen" });
  }
});

/* ==========================================================
   PUT: Ubah Dokumen Berdasarkan ID
   ========================================================== */
router.put("/:id", requireRole("super", "semi"), (req, res) => {
  try {
    const db = getDB();
    const u = req.user;
    const d = req.body;

    const doc = db.prepare("SELECT id FROM documents WHERE id=?").get(req.params.id);
    if (!doc) return res.status(404).json({ error: "Dokumen tidak ditemukan" });

    db.prepare(`
      UPDATE documents
      SET receive_date=?, guest_name=?, booking_code=?, tour_code=?, document_remarks=?, staff=?
      WHERE id=?
    `).run(
      d.receive_date || "",
      d.guest_name || "",
      d.booking_code || "",
      d.tour_code || "",
      d.document_remarks || "",
      u.username || "",
      req.params.id
    );

    logAction(u, "Mengubah Dokumen", d.booking_code || d.guest_name);
    res.json({ message: "Dokumen berhasil diperbarui" });
  } catch (err) {
    console.error("Error updating document:", err);
    res.status(500).json({ error: "Gagal memperbarui dokumen" });
  }
});

/* ==========================================================
   DELETE: Hapus Dokumen
   ========================================================== */
router.delete("/:id", requireRole("super"), (req, res) => {
  try {
    const db = getDB();
    const u = req.user;
    const d = db.prepare("SELECT booking_code, guest_name FROM documents WHERE id=?").get(req.params.id);

    if (!d) return res.status(404).json({ error: "Dokumen tidak ditemukan" });

    db.prepare("DELETE FROM documents WHERE id=?").run(req.params.id);
    logAction(u, "Menghapus Dokumen", d.booking_code || d.guest_name);

    res.json({ message: "Dokumen berhasil dihapus" });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ error: "Gagal menghapus dokumen" });
  }
});

module.exports = router;
