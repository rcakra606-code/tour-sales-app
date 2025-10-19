/**
 * ==========================================================
 * controllers/targetController.js
 * Travel Dashboard Enterprise — Target Bulanan per User
 * ==========================================================
 * ✅ CRUD targets per user per bulan
 * ✅ Summary target vs realisasi (sales/profit/tours)
 * ✅ Role-based: super/semi input, basic read-only
 * ==========================================================
 */

const db = require("../config/database").getDB();
const logger = require("../config/logger");

// ============================================================
// 📘 GET /api/targets
// optional query: staff, month, year
// ============================================================
exports.getTargets = async (req, res) => {
  try {
    const { staff, month, year } = req.query;
    let q = "SELECT * FROM targets WHERE 1=1";
    const params = [];
    if (staff) { q += " AND LOWER(staff_name) = ?"; params.push(staff.toLowerCase()); }
    if (month) { q += " AND month = ?"; params.push(parseInt(month)); }
    if (year) { q += " AND year = ?"; params.push(parseInt(year)); }
    q += " ORDER BY year DESC, month DESC, staff_name ASC";
    const rows = await db.all(q, params);
    res.json(rows);
  } catch (err) {
    logger.error("❌ Error getTargets:", err);
    res.status(500).json({ message: "Gagal mengambil data targets" });
  }
};

// ============================================================
// 🟢 POST /api/targets
// body: staff_name, month, year, target_sales, target_profit, target_tour
// Roles: super (any), semi (only own)
// ============================================================
exports.createOrUpdateTarget = async (req, res) => {
  try {
    const user = req.user; // from verifyToken
    const {
      staff_name,
      month,
      year,
      target_sales = 0,
      target_profit = 0,
      target_tour = 0,
    } = req.body;

    if (!staff_name || !month || !year) {
      return res.status(400).json({ message: "staff_name, month, year wajib diisi" });
    }

    if (user.role === "semi" && user.username !== staff_name) {
      return res.status(403).json({ message: "Tidak punya izin mengatur target pengguna lain" });
    }

    const existing = await db.get(
      "SELECT id FROM targets WHERE LOWER(staff_name)=? AND month=? AND year=?",
      [staff_name.toLowerCase(), month, year]
    );

    if (existing) {
      await db.run(
        `UPDATE targets SET
          target_sales = ?,
          target_profit = ?,
          target_tour = ?,
          created_by = ?,
          created_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [target_sales, target_profit, target_tour, user.username, existing.id]
      );
      logger.info(`✏️ Target updated for ${staff_name} ${month}/${year} by ${user.username}`);
      res.json({ message: "Target berhasil diperbarui" });
    } else {
      await db.run(
        `INSERT INTO targets (staff_name, month, year, target_sales, target_profit, target_tour, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [staff_name, month, year, target_sales, target_profit, target_tour, user.username]
      );
      logger.info(`✅ Target created for ${staff_name} ${month}/${year} by ${user.username}`);
      res.json({ message: "Target berhasil dibuat" });
    }
  } catch (err) {
    logger.error("❌ Error createOrUpdateTarget:", err);
    res.status(500).json({ message: "Gagal menyimpan target" });
  }
};

// ============================================================
// 🟡 PUT /api/targets/:id
// ============================================================
exports.updateTarget = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { target_sales, target_profit, target_tour } = req.body;
    const row = await db.get("SELECT * FROM targets WHERE id = ?", [id]);
    if (!row) return res.status(404).json({ message: "Target tidak ditemukan" });
    if (user.role === "semi" && user.username !== row.staff_name) {
      return res.status(403).json({ message: "Tidak punya izin memperbarui target ini" });
    }

    await db.run(
      `UPDATE targets SET target_sales=?, target_profit=?, target_tour=?, created_by=?, created_at=CURRENT_TIMESTAMP WHERE id=?`,
      [target_sales || row.target_sales, target_profit || row.target_profit, target_tour || row.target_tour, user.username, id]
    );
    logger.info(`✏️ Target ID ${id} updated by ${user.username}`);
    res.json({ message: "Target berhasil diperbarui" });
  } catch (err) {
    logger.error("❌ Error updateTarget:", err);
    res.status(500).json({ message: "Gagal memperbarui target" });
  }
};

// ============================================================
// 🔴 DELETE /api/targets/:id (super only)
// ============================================================
exports.deleteTarget = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "super") return res.status(403).json({ message: "Hanya super yang bisa menghapus target" });
    const { id } = req.params;
    const row = await db.get("SELECT * FROM targets WHERE id = ?", [id]);
    if (!row) return res.status(404).json({ message: "Target tidak ditemukan" });
    await db.run("DELETE FROM targets WHERE id = ?", [id]);
    logger.warn(`🗑️ Target ID ${id} deleted by ${user.username}`);
    res.json({ message: "Target berhasil dihapus" });
  } catch (err) {
    logger.error("❌ Error deleteTarget:", err);
    res.status(500).json({ message: "Gagal menghapus target" });
  }
};

// ============================================================
// 📊 GET /api/targets/summary
// returns: { target, real, percentage }
// ============================================================
exports.getTargetsSummary = async (req, res) => {
  try {
    const { staff, month, year } = req.query;
    const staffName = staff || req.user.username;
    const m = parseInt(month);
    const y = parseInt(year);

    const target = await db.get(
      "SELECT * FROM targets WHERE LOWER(staff_name)=? AND month=? AND year=?",
      [staffName.toLowerCase(), m, y]
    );

    const salesRow = await db.get(
      `SELECT 
         IFNULL(SUM(sales_amount),0) as real_sales,
         IFNULL(SUM(profit_amount),0) as real_profit
       FROM sales
       WHERE LOWER(staff_name)=? AND strftime('%m', transaction_date)=? AND strftime('%Y', transaction_date)=?`,
      [staffName.toLowerCase(), String(m).padStart(2, "0"), String(y)]
    );

    const toursRow = await db.get(
      `SELECT COUNT(id) as real_tours
        FROM tours
        WHERE LOWER(staff)=? AND strftime('%m', registrationDate)=? AND strftime('%Y', registrationDate)=?`,
      [staffName.toLowerCase(), String(m).padStart(2, "0"), String(y)]
    );

    const real = {
      sales: salesRow?.real_sales || 0,
      profit: salesRow?.real_profit || 0,
      tours: toursRow?.real_tours || 0,
    };

    const tgt = {
      sales: target?.target_sales || 0,
      profit: target?.target_profit || 0,
      tours: target?.target_tour || 0,
    };

    const percentage = {
      sales: tgt.sales > 0 ? Math.min(100, Math.round((real.sales / tgt.sales) * 100)) : 0,
      profit: tgt.profit > 0 ? Math.min(100, Math.round((real.profit / tgt.profit) * 100)) : 0,
      tours: tgt.tours > 0 ? Math.min(100, Math.round((real.tours / tgt.tours) * 100)) : 0,
    };

    res.json({ staff: staffName, month: m, year: y, target: tgt, real, percentage });
  } catch (err) {
    logger.error("❌ Error getTargetsSummary:", err);
    res.status(500).json({ message: "Gagal mengambil summary target" });
  }
};
