// scripts/check-db.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'database.sqlite');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

try {
  const db = new Database(dbPath);
  db.prepare(`CREATE TABLE IF NOT EXISTS health_check (id INTEGER PRIMARY KEY, checked_at TEXT)`).run();
  db.prepare(`INSERT INTO health_check (checked_at) VALUES (?)`).run(new Date().toISOString());
  console.log(`✅ Database check OK: ${dbPath}`);
  db.close();
} catch (err) {
  console.error('❌ Database check failed:', err.message);
  process.exit(1);
}
