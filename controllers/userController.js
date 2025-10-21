// controllers/userController.js
import bcrypt from "bcrypt";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * GET /api/users
 * List all users (Admin only)
 */
export async function getUsers(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses hanya untuk Admin" });
    }

    const q = `SELECT id, username, staff_name, role, created_at FROM users ORDER BY id ASC;`;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error("❌ getUsers error:", err);
    res.status(500).json({ message: "Gagal memuat data user" });
  }
}

/**
 * POST /api/users
 * Create new user (Admin only)
 */
export async function createUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses hanya untuk Admin" });
    }

    const { username, staff_name, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
    const hashed = await bcrypt.hash(password, saltRounds);

    const insertQ = `
      INSERT INTO users (username, staff_name, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, staff_name, role;
    `;
    const values = [username, staff_name || username, hashed, role];
    const { rows } = await pool.query(insertQ, values);

    res.status(201).json({
      message: "User berhasil dibuat",
      user: rows[0],
    });
  } catch (err) {
    console.error("❌ createUser error:", err);
    res.status(500).json({ message: "Gagal membuat user" });
  }
}

/**
 * DELETE /api/users/:id
 * Delete user (Admin only)
 */
export async function deleteUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses hanya untuk Admin" });
    }

    const { id } = req.params;
    await pool.query(`DELETE FROM users WHERE id = $1;`, [id]);
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("❌ deleteUser error:", err);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
}