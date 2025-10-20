import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function init() {
  console.log("⏳ Initializing database...");
  const sql = await Bun.file("./scripts/initDatabase.sql").text();
  await pool.query(sql);
  console.log("✅ Database initialized successfully!");
  await pool.end();
}

init().catch((err) => {
  console.error("❌ Error initializing DB:", err);
  process.exit(1);
});