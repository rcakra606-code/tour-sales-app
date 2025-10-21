// ==========================================================
// 👥 Travel Dashboard Enterprise v5.3
// Setup Testing Accounts (Admin, SemiAdmin, Staff)
// ==========================================================
import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function createTestUsers() {
  const users = [
    { username: "admin_test", staff_name: "Admin Tester", password: "admin123", role: "admin" },
    { username: "semiadmin_test", staff_name: "Semi Admin Tester", password: "semi123", role: "semiadmin" },
    { username: "staff_test", staff_name: "Staff Tester", password: "staff123", role: "staff" },
  ];

  try {
    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 10);
      const exists = await pool.query("SELECT id FROM users WHERE username = $1", [u.username]);
      if (exists.rows.length === 0) {
        await pool.query(
          "INSERT INTO users (username, staff_name, password, role) VALUES ($1, $2, $3, $4)",
          [u.username, u.staff_name, hashed, u.role]
        );
        console.log(`✅ Created: ${u.username} (${u.role})`);
      } else {
        console.log(`ℹ️ User already exists: ${u.username}`);
      }
    }
    console.log("🎯 All test users created successfully!");
  } catch (err) {
    console.error("❌ Error creating test users:", err.message);
  } finally {
    await pool.end();
  }
}

createTestUsers();