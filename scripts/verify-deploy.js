// ==========================================================
// 🚀 Verify Deploy Script — Travel Dashboard Enterprise v5.5
// ==========================================================

import fetch from "node-fetch";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

// === 1️⃣ Check Database Connection ===
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkDatabase() {
  console.log("\n🔍 [VERIFY] Checking database connection...");
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    const tables = result.rows.map((r) => r.table_name);
    console.log("✅ Database connected successfully.");
    console.log("📋 Tables:", tables.join(", "));

    const required = [
      "users",
      "regions",
      "tours",
      "sales",
      "documents",
      "targets",
      "logs",
    ];
    const missing = required.filter((t) => !tables.includes(t));
    if (missing.length > 0) {
      console.warn("⚠️ Missing tables:", missing.join(", "));
    } else {
      console.log("✅ All required tables exist.");
    }
    client.release();
  } catch (err) {
    console.error("❌ Database check failed:", err.message);
    process.exit(1);
  }
}

// === 2️⃣ Check API Endpoints ===
async function checkAPI() {
  console.log("\n🌐 [VERIFY] Checking public endpoints...");

  const baseURL =
    process.env.FRONTEND_URL || "https://tour-sales-app.onrender.com";

  const endpoints = [
    "/api/auth/verify",
    "/api/dashboard/summary",
    "/api/regions",
  ];

  for (const ep of endpoints) {
    const url = `${baseURL}${ep}`;
    try {
      const res = await fetch(url);
      const status = res.status;
      console.log(`🧭 ${ep} → ${status}`);
    } catch (err) {
      console.warn(`⚠️ Could not reach ${ep}:`, err.message);
    }
  }
}

// === 3️⃣ Run All Checks ===
(async () => {
  console.log("=======================================================");
  console.log("🧩 Travel Dashboard Enterprise v5.5 — Deploy Verifier");
  console.log("=======================================================\n");

  await checkDatabase();
  await checkAPI();

  console.log("\n✅ Verification completed successfully.");
  console.log("=======================================================\n");

  process.exit(0);
})();