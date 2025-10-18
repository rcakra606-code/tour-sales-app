/**
 * ==========================================================
 * routes/tours.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ PostgreSQL (Neon) Ready
 * ✅ CRUD Tour Data
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

// Middleware Auth
router.use(auth);

/**
 * ==========================================================
 * GET /api/tours
 * Ambil semua data tour
 * ==========================================================
 */
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, registrationdate, leadpassenger, allpassengers, tourcode, region, departuredate, bookingcode, tourprice, salesamount, profitamount, departurestatus, staff FROM tours ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error GET /tours:", err.message);
    res.status(500).json({ error: "Gagal memuat data tour" });
  }
});

/**
 * ==========================================================
 * GET /api/tours/:id
 * Ambil detail tour berdasarkan ID
 * ==========================================================
 */
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tours WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Tour tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error GET /tours/:id:", err.message);
    res.status(500).json({ error: "Gagal mengambil detail tour" });
  }
});

/**
 * ==========================================================
 * POST /api/tours
 * Tambah data tour baru (super/semi)
 * ==========================================================
 */
router.post("/", requireRole("super", "semi"), async (req, res) => {
  try {
    const data = req.body;
    const sql = `
      INSERT INTO tours (
        registrationdate, leadpassenger, allpassengers, tourcode, region,
        departuredate, bookingcode, tourprice, salesamount, profitamount,
        departurestatus, staff
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id
    `;
    const params = [
      data.registrationDate || null,
      data.leadPassenger || null,
      data.allPassengers || null,
      data.tourCode || null,
      data.region || null,
      data.departureDate || null,
      data.bookingCode || null,
      data.tourPrice || 0,
      data.salesAmount || 0,
      data.profitAmount || 0,
      data.departureStatus || "PENDING",
      req.user.username,
    ];

    const result = await db.query(sql, params);
    await logAction(req.user, "Menambahkan Tour", `Tour ID: ${result.rows[0].id}`);
    res.json({ message: "✅ Data tour berhasil ditambahkan" });
  } catch (err) {
    console.error("❌ Error POST /tours:", err.message);
    res.status(500).json({ error: "Gagal menambahkan tour" });
  }
});

/**
 * ==========================================================
 * PUT /api/tours/:id
 * Ubah data tour (super/semi)
 * ==========================================================
 */
router.put("/:id", requireRole("super", "semi"), async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const sql = `
      UPDATE tours SET
        registrationdate=$1, leadpassenger=$2, allpassengers=$3, tourcode=$4,
        region=$5, departuredate=$6, bookingcode=$7, tourprice=$8,
        salesamount=$9, profitamount=$10, departurestatus=$11
      WHERE id=$12
    `;
    const params = [
      data.registrationDate || null,
      data.leadPassenger || null,
      data.allPassengers || null,
      data.tourCode || null,
      data.region || null,
      data.departureDate || null,
      data.bookingCode || null,
      data.tourPrice || 0,
      data.salesAmount || 0,
      data.profitAmount || 0,
      data.departureStatus || "PENDING",
      id,
    ];

    await db.query(sql, params);
    await logAction(req.user, "Mengubah Data Tour", `Tour ID: ${id}`);
    res.json({ message: "✅ Data tour berhasil diperbarui" });
  } catch (err) {
    console.error("❌ Error PUT /tours/:id:", err.message);
    res.status(500).json({ error: "Gagal memperbarui tour" });
  }
});

/**
 * ==========================================================
 * DELETE /api/tours/:id
 * Hapus data tour (super only)
 * ==========================================================
 */
router.delete("/:id", requireRole("super"), async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query("SELECT tourcode FROM tours WHERE id=$1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Tour tidak ditemukan" });

    const tourCode = result.rows[0].tourcode || `ID:${id}`;
    await db.query("DELETE FROM tours WHERE id=$1", [id]);
    await logAction(req.user, "Menghapus Tour", tourCode);

    res.json({ message: "🗑️ Data tour berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error DELETE /tours/:id:", err.message);
    res.status(500).json({ error: "Gagal menghapus tour" });
  }
});

module.exports = router;
