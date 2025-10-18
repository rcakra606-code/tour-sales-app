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

// GET ALL SALES
router.get("/", (req, res) => {
  try {
    const db = getDB();
    const sales = db.prepare("SELECT * FROM sales ORDER BY id DESC").all();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE
router.get("/:id", (req, res) => {
  try {
    const db = getDB();
    const s = db.prepare("SELECT * FROM sales WHERE id=?").get(req.params.id);
    if (!s) return res.status(404).json({ error: "Data sales tidak ditemukan" });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE SALES
router.post("/", requireRole("super", "semi"), (req, res) => {
  try {
    const db = getDB();
    const u = req.user;
    const d = req.body;
    db.prepare(`
      INSERT INTO sales (transaction_date, invoice_number, sales_amount, profit_amount, discount_amount, staff_username)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      d.transaction_date || "",
      d.invoice_number || "",
      d.sales_amount || 0,
      d.profit_amount || 0,
      d.discount_amount || 0,
      u.username || ""
    );
    logAction(u, "Menambahkan Sales Baru", d.invoice_number);
    res.json({ message: "Sales berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE SALES
router.put("/:id", requireRole("super", "semi"), (req, res) => {
  try {
    const db = getDB();
    const u = req.user;
    const d = req.body;
    db.prepare(`
      UPDATE sales SET
      transaction_date=?, invoice_number=?, sales_amount=?, profit_amount=?, discount_amount=?, staff_username=?
      WHERE id=?
    `).run(
      d.transaction_date || "",
      d.invoice_number || "",
      d.sales_amount || 0,
      d.profit_amount || 0,
      d.discount_amount || 0,
      u.username || "",
      req.params.id
    );
    logAction(u, "Mengubah Data Sales", d.invoice_number);
    res.json({ message: "Sales berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE SALES
router.delete("/:id", requireRole("super"), (req, res) => {
  try {
    const db = getDB();
    const u = req.user;
    const s = db.prepare("SELECT invoice_number FROM sales WHERE id=?").get(req.params.id);
    if (!s) return res.status(404).json({ error: "Sales tidak ditemukan" });
    db.prepare("DELETE FROM sales WHERE id=?").run(req.params.id);
    logAction(u, "Menghapus Sales", s.invoice_number);
    res.json({ message: "Sales dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
