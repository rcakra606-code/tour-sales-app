// ==========================================================
// 💰 Sales Controller — Travel Dashboard Enterprise v5.4.6
// ==========================================================

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================================================
// 🔹 GET /api/sales — Ambil Semua Data Sales
// ==========================================================
export async function getSales(req, res) {
  try {
    const { staff, month } = req.query;
    let filters = [];
    let values = [];
    let i = 1;

    if (staff) {
      filters.push(`LOWER(staff_name) = LOWER($${i})`);
      values.push(staff);
      i++;
    }

    if (month) {
      filters.push(`TO_CHAR(transaction_date, 'YYYY-MM') = $${i}`);
      values.push(month);
      i++;
    }

    const whereClause = filters.length ? "WHERE " + filters.join(" AND ") : "";

    const query = `
      SELECT id, transaction_date, invoice_number, staff_name, client_name,
             sales_amount, profit_amount, category, tour_code, notes
      FROM sales
      ${whereClause}
      ORDER BY transaction_date DESC;
    `;

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error("❌ GET sales error:", err);
    res.status(500).json({ message: "Gagal memuat data sales." });
  }
}

// ==========================================================
// 🔹 GET /api/sales/:id — Ambil Data Sales Berdasarkan ID
// ==========================================================
export async function getSaleById(req, res) {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM sales WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data sales tidak ditemukan." });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Get sale by ID error:", err);
    res.status(500).json({ message: "Gagal mengambil data sales." });
  }
}

// ==========================================================
// 🔹 POST /api/sales — Tambah Data Sales Baru
// ==========================================================
export async function createSale(req, res) {
  try {
    const {
      transaction_date,
      invoice_number,
      staff_name,
      client_name,
      sales_amount,
      profit_amount,
      category,
      tour_code,
      notes,
    } = req.body;

    const query = `
      INSERT INTO sales (
        transaction_date, invoice_number, staff_name, client_name,
        sales_amount, profit_amount, category, tour_code, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id;
    `;

    const values = [
      transaction_date || null,
      invoice_number || null,
      staff_name || null,
      client_name || null,
      parseFloat(sales_amount) || 0,
      parseFloat(profit_amount) || 0,
      category || null,
      tour_code || null,
      notes || null,
    ];

    await pool.query(query, values);
    res.json({ message: "Data sales berhasil ditambahkan." });
  } catch (err) {
    console.error("❌ Create sales error:", err);
    res.status(500).json({ message: "Gagal menambah data sales." });
  }
}

// ==========================================================
// 🔹 PUT /api/sales/:id — Update Data Sales
// ==========================================================
export async function updateSale(req, res) {
  try {
    const { id } = req.params;
    const {
      transaction_date,
      invoice_number,
      staff_name,
      client_name,
      sales_amount,
      profit_amount,
      category,
      tour_code,
      notes,
    } = req.body;

    const query = `
      UPDATE sales
      SET transaction_date=$1, invoice_number=$2, staff_name=$3, client_name=$4,
          sales_amount=$5, profit_amount=$6, category=$7, tour_code=$8, notes=$9
      WHERE id=$10
      RETURNING id;
    `;

    const values = [
      transaction_date || null,
      invoice_number || null,
      staff_name || null,
      client_name || null,
      parseFloat(sales_amount) || 0,
      parseFloat(profit_amount) || 0,
      category || null,
      tour_code || null,
      notes || null,
      id,
    ];

    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data sales tidak ditemukan." });
    }

    res.json({ message: "Data sales berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Update sales error:", err);
    res.status(500).json({ message: "Gagal memperbarui data sales." });
  }
}

// ==========================================================
// 🔹 DELETE /api/sales/:id — Hapus Data Sales
// ==========================================================
export async function deleteSale(req, res) {
  try {
    const { id } = req.params;
    const query = `DELETE FROM sales WHERE id = $1;`;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Data sales tidak ditemukan." });
    }

    res.json({ message: "Data sales berhasil dihapus." });
  } catch (err) {
    console.error("❌ Delete sales error:", err);
    res.status(500).json({ message: "Gagal menghapus data sales." });
  }
}