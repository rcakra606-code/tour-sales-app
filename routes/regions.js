const express = require("express");
const router = express.Router();
const { getDB } = require("../db");
const auth = require("../middleware/auth");
const { logAction } = require("../middleware/log");

router.use(auth);

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.type))
      return res.status(403).json({ error: "Akses ditolak" });
    next();
  };
}

// GET semua region
router.get("/", (req, res) => {
  const db = getDB();
  const regions = db.prepare("SELECT * FROM regions ORDER BY name ASC").all();
  res.json(regions);
});

// POST tambah region baru
router.post("/", requireRole("super", "semi"), (req, res) => {
  const db = getDB();
  const { name } = req.body;
  db.prepare("INSERT OR IGNORE INTO regions (name) VALUES (?)").run(name.trim());
  logAction(req.user, "Menambahkan Region", name);
  res.json({ message: "Region berhasil ditambahkan" });
});

// DELETE hapus region
router.delete("/:id", requireRole("super"), (req, res) => {
  const db = getDB();
  db.prepare("DELETE FROM regions WHERE id=?").run(req.params.id);
  logAction(req.user, "Menghapus Region", `ID ${req.params.id}`);
  res.json({ message: "Region dihapus" });
});

module.exports = router;
