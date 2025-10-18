const express = require("express");
const router = express.Router();
const { getDB } = require("../db");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    if (!["super", "semi"].includes(user.type)) {
      return res.status(403).json({ error: "Akses ditolak." });
    }
    const logs = db.prepare(`
      SELECT id, username, role, action, target, timestamp
      FROM logs
      ORDER BY timestamp DESC
      LIMIT 200
    `).all();
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
