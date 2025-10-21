#!/usr/bin/env node
/**
 * scripts/restore-database.js
 * Restore data from a backup gzipped JSON file (created by backup-database.js)
 *
 * Usage:
 *   node scripts/restore-database.js ./backups/backup_20250101_120000.json.gz
 *
 * WARNING: This script TRUNCATES target tables before inserting. Use in dev or when sure.
 */

import fs from "fs/promises";
import path from "path";
import zlib from "zlib";
import { pipeline } from "stream/promises";
import { createReadStream } from "fs";
import { fileURLToPath } from "url";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

if (!process.argv[2]) {
  console.error("Usage: node scripts/restore-database.js <path-to-backup.json.gz>");
  process.exit(1);
}
const BACKUP_FILE = path.resolve(process.argv[2]);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Tables order (same order as in backup; adjust if you use FK constraints)
const TABLES = [
  "users",
  "regions",
  "tours",
  "sales",
  "targets",
  "documents",
  "logs"
];

async function restore() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set. Aborting.");
    process.exit(1);
  }
  try {
    // decompress and parse
    const gunzip = zlib.createGunzip();
    const chunks = [];
    await pipeline(createReadStream(BACKUP_FILE), gunzip, async function* (source) {
      for await (const chunk of source) {
        chunks.push(chunk);
      }
    });

    const jsonStr = Buffer.concat(chunks).toString("utf8");
    const data = JSON.parse(jsonStr);

    console.log("🔄 Starting restore, this will truncate tables and insert backup rows. Proceeding...");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // truncate tables in order
      for (const t of TABLES) {
        // only operate if present in backup
        if (!Array.isArray(data[t])) {
          console.log(`  ⚠️ Table ${t} not present in backup — skipping TRUNCATE/INSERT`);
          continue;
        }
        await client.query(`TRUNCATE TABLE ${t} RESTART IDENTITY CASCADE`);
        console.log(`  🧹 Truncated ${t}`);

        const rows = data[t];
        if (!rows.length) {
          console.log(`  (no rows) ${t}`);
          continue;
        }

        // dynamic insert for each row
        for (const row of rows) {
          const cols = Object.keys(row);
          const vals = Object.values(row);
          const placeholders = cols.map((_, i) => `$${i + 1}`).join(",");
          const query = `INSERT INTO ${t} (${cols.map(c => `"${c}"`).join(",")}) VALUES (${placeholders})`;
          try {
            await client.query(query, vals);
          } catch (err) {
            console.warn(`    ⚠️ Insert into ${t} failed for row id=${row.id || "<no-id>"}: ${err.message}`);
          }
        }
        console.log(`  ✅ Restored ${rows.length} rows into ${t}`);
      }

      await client.query("COMMIT");
      console.log("✅ Restore completed successfully.");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("❌ Restore failed, transaction rolled back:", err.message);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ Failed to read/parse backup file:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

restore();