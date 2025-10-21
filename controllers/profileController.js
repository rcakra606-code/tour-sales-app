// controllers/profileController.js
import bcrypt from "bcryptjs";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * GET /api/profile
 * Return currently authenticated user's profile
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const q = `SELECT id, username, staff_name, role, created_at
               FROM users WHERE id = $1 LIMIT 1`;
    const { rows } = await pool.query(q, [userId]);

    if (!rows.length) return res.status(404).json({ message: "User not found" });
    const user = rows[0];
    return res.json({
      id: user.id,
      username: user.username,
      staff_name: user.staff_name,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (err) {
    console.error("❌ getProfile error:", err);
    return res.status(500).json({ message: "Gagal memuat profil" });
  }
}

/**
 * PUT /api/profile
 * Update staff_name and/or password for authenticated user.
 * Body:
 *  - staff_name (string, required)
 *  - newPassword (string, optional)
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { staff_name, newPassword } = req.body;

    if (!staff_name || staff_name.toString().trim() === "") {
      return res.status(400).json({ message: "Nama staff wajib diisi" });
    }

    // Start a transaction to ensure atomic update
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update staff_name
      const updateNameQ = `UPDATE users SET staff_name = $1 WHERE id = $2`;
      await client.query(updateNameQ, [staff_name, userId]);

      // If password provided, validate & hash then update
      if (newPassword && newPassword.toString().trim().length > 0) {
        if (newPassword.length < 6) {
          await client.query("ROLLBACK");
          return res.status(400).json({ message: "Password minimal 6 karakter" });
        }
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
        const hashed = await bcrypt.hash(newPassword, saltRounds);
        const updatePassQ = `UPDATE users SET password_hash = $1 WHERE id = $2`;
        await client.query(updatePassQ, [hashed, userId]);
      }

      await client.query("COMMIT");

      // Return updated minimal profile
      const { rows } = await pool.query(
        `SELECT id, username, staff_name, role FROM users WHERE id=$1 LIMIT 1`,
        [userId]
      );

      return res.json({
        message: "Profil berhasil diperbarui",
        user: rows[0],
      });
    } catch (txErr) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("❌ updateProfile transaction error:", txErr);
      return res.status(500).json({ message: "Gagal memperbarui profil" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ updateProfile error:", err);
    return res.status(500).json({ message: "Gagal memperbarui profil" });
  }
}
