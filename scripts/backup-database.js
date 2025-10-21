#!/usr/bin/env node
/**
 * scripts/backup-database.js
 * Create JSON gzip backup of selected tables and manage retention.
 *
 * Usage:
 *   node scripts/backup-database.js
 *
 * Env:
 *   DATABASE_URL         (required) - neon/postgres connection string
 *   BACKUP_DIR           (optional) - path to save backups (default ./backups)
 *   BACKUP_RETENTION_DAYS (optional) - keep last N backups (default 7)
 */

import fs from "fs/promises";
import path from "path";
import zlib from "zlib";
import { pipeline } from "stream/promises";
import { fileURLToPath } from "url";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
const RETENTION_DAYS = Number(process.env.BACKUP_RETENTION_DAYS || 7);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Tables to backup — sesuaikan jika perlu
const TABLES = [
  "users",
  "tours",
  "sales",
  "targets",
  "documents",
  "regions",
  "logs"
];

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    // ignore
  }
}

function timestamp() {
  const d = new Date();
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${YYYY}${MM}${DD}_${hh}${mm}${ss}`;
}

async function backup() {
  console.log("🔍 Starting backup...");
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set. Aborting.");
    process.exit(1);
  }

  await ensureDir(BACKUP_DIR);

  const fileBase = `backup_${timestamp()}`;
  const outPath = path.join(BACKUP_DIR, `${fileBase}.json.gz`);
  const tmpPath = path.join(BACKUP_DIR, `${fileBase}.json`);

  try {
    // Query each table and build an object
    const result = {};
    for (const table of TABLES) {
      try {
        const q = `SELECT * FROM ${table} ORDER BY id ASC NULLS LAST`;
        const { rows } = await pool.query(q);
        result[table] = rows;
        console.log(`  ✅ Fetched ${rows.length} rows from "${table}"`);
      } catch (err) {
        // if table doesn't exist, skip but log
        console.warn(`  ⚠️ Skipping table "${table}": ${err.message}`);
        result[table] = [];
      }
    }

    // Write JSON to temp file
    await fs.writeFile(tmpPath, JSON.stringify(result, null, 2), "utf8");

    // Gzip it (stream)
    const gzip = zlib.createGzip();
    const source = await fs.open(tmpPath, "r");
    const destination = await fs.open(outPath, "w");
    const readStream = source.createReadStream();
    const writeStream = destination.createWriteStream();
    await pipeline(readStream, gzip, writeStream);
    await source.close();
    await destination.close();

    // Remove tmp file
    await fs.unlink(tmpPath);

    console.log(`✅ Backup written to ${outPath}`);

    // Purge old backups beyond retention
    await purgeOldBackups(BACKUP_DIR, RETENTION_DAYS);

  } catch (err) {
    console.error("❌ Backup failed:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

async function purgeOldBackups(dir, keepDays) {
  if (!keepDays || keepDays <= 0) return;
  try {
    const files = await fs.readdir(dir);
    const backups = files
      .filter((f) => f.endsWith(".json.gz"))
      .map((f) => ({ file: f, time: fs.stat(path.join(dir, f)).then(s => s.mtime) }));

    // resolve mtimes
    const resolved = await Promise.all(backups.map(async (b) => ({ file: b.file, mtime: await b.time })));
    resolved.sort((a, b) => b.mtime - a.mtime); // newest first

    const keep = resolved.slice(0, keepDays);
    const remove = resolved.slice(keepDays);

    for (const r of remove) {
      try {
        await fs.unlink(path.join(dir, r.file));
        console.log(`🗑️ Removed old backup ${r.file}`);
      } catch (err) {
        console.warn(`⚠️ Failed to remove ${r.file}: ${err.message}`);
      }
    }

    console.log(`🧹 Retention: kept ${keep.length} backups, removed ${remove.length}`);
  } catch (err) {
    console.warn("⚠️ Purge old backups failed:", err.message);
  }
}

backup();