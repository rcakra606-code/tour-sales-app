// test-db.js
require("dotenv").config();
const db = require("./config/database");

(async () => {
  console.log("→ Testing DB connection string:", process.env.DATABASE_URL ? "[SET]" : "[NOT SET]");
  const ok = await db.verifyConnection(3, 2000);
  if (!ok) {
    console.error("→ DB connection failed. Check DATABASE_URL, network, and Neon settings.");
    process.exit(1);
  }
  console.log("→ Test query: SELECT 1");
  const r = await db.query("SELECT 1 as ok");
  console.log("→ Query result:", r.rows);
  process.exit(0);
})();
