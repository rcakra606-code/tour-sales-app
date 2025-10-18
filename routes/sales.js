/**
 * ==========================================================
 * routes/sales.js — Travel Dashboard Enterprise v3.4.1
 * ==========================================================
 * ✅ PostgreSQL (Neon) Ready
 * ✅ CRUD Sales Data
 * ✅ Role-based Access Control
 * ✅ Audit Logging Integration
 * ==========================================================
 */

const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/auth");
const { logAction } = require("../middleware/log");
const { requireRole } = require("../middleware/roleCheck");

const router = express.Router();

// Middleware auth untuk semua route
router.use(auth);

/**
 * ==========================================================
 * GET /api/sales
 * Ambil semua data sales
 * ==========================================================
 */
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, transaction_date, invoice_number, sales_amount, 
              profit_amount, discount_amount, staff_username 
       FROM sales ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error GET /sales:", err.message);
    res.status(500).json({ error: "Gagal memuat data sales" });
  }
});

/**
 * ==========================================================
 * GET /api/sales/:id
 * Ambil detail sales berdasarkan ID
 * ==========================================================
 */
router.get("/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM sales WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Sales tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error GET /sales/:id:", err.message);
    res.status(500).json({ error: "Gagal mengambil detail sales" });
  }
});

/**
 * ==========================================================
 * POST /api/sales
 * Tambah data sales baru (super/semi)
 * ==========================================================
 */
router.post("/", requireRole("super", "semi"), async (req, res) => {
  try {
    const data = req.body;
    const sql = `
      INSERT INTO sales (
        transaction_date, invoice_number, sales_amount, profit_amount, 
        discount_amount, staff_username
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const params = [
      data.transaction_date || null,
      data.invoice_number || null,
      data.sales_amount || 0,
      data.profit_amount || 0,
      data.discount_amount || 0,
      req.user.username
    ];

    const result = await db.query(sql, params);
    await logAction(req.user, "Menambahkan Sales", `Sales ID: ${result.rows[0].id}`);
    res.json({ message: "✅ Data sales berhasil ditambahkan" });
  } catch (err) {
    console.error("❌ Error POST /sales:", err.message);
    res.status(500).json({ error: "Gagal menambahkan sales" });
  }
});

/**
 * ==========================================================
 * PUT /api/sales/:id
 * Update data sales (super/semi)
 * ==========================================================
 */
router.put("/:id", requireRole("super", "semi"), async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const sql = `
      UPDATE sales SET 
        transaction_date=$1, invoice_number=$2, sales_amount=$3, 
        profit_amount=$4, discount_amount=$5
      WHERE id=$6
    `;
    const params = [
      data.transaction_date || null,
      data.invoice_number || null,
      data.sales_amount || 0,
      data.profit_amount || 0,
      data.discount_amount || 0,
      id
    ];

    await db.query(sql, params);
    await logAction(req.user, "Mengubah Sales", `Sales ID: ${id}`);
    res.json({ message: "✅ Data sales berhasil diperbarui" });
  } catch (err) {
    console.error("❌ Error PUT /sales/:id:", err.message);
    res.status(500).json({ error: "Gagal memperbarui sales" });
  }
});

/**
 * ==========================================================
 * DELETE /api/sales/:id
 * Hapus data sales (super only)
 * ==========================================================
 */
router.delete("/:id", requireRole("super"), async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.query("SELECT invoice_number FROM sales WHERE id=$1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Sales tidak ditemukan" });

    const invoice = result.rows[0].invoice_number || `ID:${id}`;
    await db.query("DELETE FROM sales WHERE id=$1", [id]);
    await logAction(req.user, "Menghapus Sales", invoice);

    res.json({ message: "🗑️ Data sales berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error DELETE /sales/:id:", err.message);
    res.status(500).json({ error: "Gagal menghapus sales" });
  }
});

module.exports = router;
