const Database = require("better-sqlite3");
const db = new Database("./data/travel.db");

db.exec(`
ALTER TABLE users ADD COLUMN last_login TEXT;
`);

console.log("✅ Migration complete.");
