/**
 * ==========================================================
 * routes/logs.js — Travel Dashboard Enterprise v3.3 Final
 * ==========================================================
 * ✅ Audit Trail & Activity Logging API
 * ✅ Role-based Access (super/semi)
 * ✅ Integrated with all modules (Tours, Sales, Documents, Auth)
 * ✅ Sorted by timestamp DESC
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const { getDB } = require("../db");
const auth = require("../middleware/auth");

router.use(auth);

/**
 * ==========================================================
 * GET /api/logs
 * Ambil seluruh aktivitas log
 * ==========================================================
 */
router.get("/", (req, res) => {
  try {
    const db = getDB();
    const logs = db
      .prepare("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 200")
      .all();
    res.json(logs);
  } catch (err) {
    console.error("Error get logs:", err);
    res.status(500).json({ error: "Gagal memuat log aktivitas" });
  }
});

/**
 * ==========================================================
 * GET /api/logs/recent
 * Ambil 10 aktivitas terakhir (untuk notifikasi dashboard)
 * ==========================================================
 */
router.get("/recent", (req, res) => {
  try {
    const db = getDB();
    const logs = db
      .prepare("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 10")
      .all();
    res.json({ ok: true, logs });
  } catch (err) {
    console.error("Error get recent logs:", err);
    res.status(500).json({ ok: false, error: "Gagal memuat log terbaru" });
  }
});

/**
 * ==========================================================
 * GET /api/logs/user/:username
 * Ambil log spesifik berdasarkan username
 * ==========================================================
 */
router.get("/user/:username", (req, res) => {
  try {
    const db = getDB();
    const logs = db
      .prepare("SELECT * FROM logs WHERE username = ? ORDER BY timestamp DESC LIMIT 100")
      .all(req.params.username);
    res.json({ ok: true, logs });
  } catch (err) {
    console.error("Error get user logs:", err);
    res.status(500).json({ ok: false, error: "Gagal memuat log user" });
  }
});

module.exports = router;
