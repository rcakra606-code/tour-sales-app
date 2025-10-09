const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'tour_sales_production';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

async function createBackup() {
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    const fname = `${DB_NAME}_backup_${ts}.sql.gz`;
    const fpath = path.join(BACKUP_DIR, fname);
    const env = { ...process.env, PGPASSWORD: DB_PASSWORD };
    const cmd = `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} | gzip > "${fpath}"`;
    try {
        console.log('Backing up to', fpath);
        await execAsync(cmd, { env, maxBuffer: 1024*1024*50 });
        const s = fs.statSync(fpath);
        console.log('Backup created', fname, (s.size/1024/1024).toFixed(2) + 'MB');
        return { filename: fname, path: fpath };
    } catch (e) {
        console.error('Backup failed', e.message);
        throw e;
    }
}

if (require.main === module) {
  createBackup().then(()=>process.exit(0)).catch(()=>process.exit(1));
}

module.exports = { createBackup };
