// scripts/backup-database.js
const fs = require('fs-extra');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');
const backupDir = path.join(__dirname, '..', 'backups');
const timestamp = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
const backupPath = path.join(backupDir, `backup-${timestamp}.sqlite`);

(async () => {
  try {
    if (!fs.existsSync(dbPath)) throw new Error('Database not found!');
    await fs.ensureDir(backupDir);
    await fs.copy(dbPath, backupPath);
    console.log(`✅ Backup created: ${backupPath}`);
  } catch (err) {
    console.error('❌ Backup failed:', err.message);
    process.exit(1);
  }
})();
