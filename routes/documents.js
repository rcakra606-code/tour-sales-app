/**
 * ==========================================================
 * routes/documents.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ PostgreSQL (Neon) Ready
 * ✅ CRUD Documents (dokumen tamu)
 * ✅ Role-based Access Control
 * ✅ Audit Logging Integration
 * ==========================================================
 */

const express = require("express");
const db = require("../config/database");
const auth = require("../middleware/auth");
const { logAction } = require("../middleware/log");
const { requireRole } = require("../middleware/roleCheck");

const router = express.Router();

// Middleware Auth untuk semua route
router.use(auth);

/**
 * ==========================================================
 * GET /api/documents
 * Ambil semua data dokumen
 * ==========================================================
 */
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, receive_date, guest_name, booking_code, tour_code, document_remarks, staff
      FROM documents
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error GET /documents:", err.message);
    res.status(500).json({ error: "Gagal memuat data dokumen" });
  }
});

/**
 * ==========================================================
 * GET /api/documents/:id
 * Ambil satu dokumen berdasarkan ID
 * ==========================================================
 */
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM documents WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Dokumen tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error GET /documents/:id:", err.message);
    res.status(500).json({ error: "Gagal mengambil detail dokumen" });
  }
});

/**
 * ==========================================================
 * POST /api/documents
 * Tambah dokumen baru (super/semi)
 * ==========================================================
 */
router.post("/", requireRole("super", "semi"), async (req, res) => {
  try {
    const data = req.body;
    const sql = `
      INSERT INTO documents (
        receive_date, guest_name, booking_code, tour_code, document_remarks, staff
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const params = [
      data.receive_date || null,
      data.guest_name || null,
      data.booking_code || null,
      data.tour_code || null,
      data.document_remarks || null,
      req.user.username
    ];

    const result = await db.query(sql, params);
    await logAction(req.user, "Menambahkan Dokumen", `Document ID: ${result.rows[0].id}`);
    res.json({ message: "✅ Data dokumen berhasil ditambahkan" });
  } catch (err) {
    console.error("❌ Error POST /documents:", err.message);
    res.status(500).json({ error: "Gagal menambahkan dokumen" });
  }
});

/**
 * ==========================================================
 * PUT /api/documents/:id
 * Ubah dokumen (super/semi)
 * ==========================================================
 */
router.put("/:id", requireRole("super", "semi"), async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const sql = `
      UPDATE documents SET
        receive_date=$1,
        guest_name=$2,
        booking_code=$3,
        tour_code=$4,
        document_remarks=$5
      WHERE id=$6
    `;
    const params = [
      data.receive_date || null,
      data.guest_name || null,
      data.booking_code || null,
      data.tour_code || null,
      data.document_remarks || null,
      id
    ];

    await db.query(sql, params);
    await logAction(req.user, "Mengubah Dokumen", `Document ID: ${id}`);
    res.json({ message: "✅ Data dokumen berhasil diperbarui" });
  } catch (err) {
    console.error("❌ Error PUT /documents/:id:", err.message);
    res.status(500).json({ error: "Gagal memperbarui dokumen" });
  }
});

/**
 * ==========================================================
 * DELETE /api/documents/:id
 * Hapus dokumen (super only)
 * ==========================================================
 */
router.delete("/:id", requireRole("super"), async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query("SELECT guest_name FROM documents WHERE id=$1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Dokumen tidak ditemukan" });

    const guest = result.rows[0].guest_name || `ID:${id}`;
    await db.query("DELETE FROM documents WHERE id=$1", [id]);
    await logAction(req.user, "Menghapus Dokumen", guest);

    res.json({ message: "🗑️ Dokumen berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error DELETE /documents/:id:", err.message);
    res.status(500).json({ error: "Gagal menghapus dokumen" });
  }
});

module.exports = router;
