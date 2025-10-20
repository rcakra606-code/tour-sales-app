/**
 * controllers/regionController.js
 * ============================================
 * Controller untuk CRUD region.
 */

import pool from "../config/database.js";
import logger from "../config/logger.js";

// GET all regions
export async function getRegions(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, code, created_at FROM regions ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    logger.error("❌ getRegions:", err);
    res.status(500).json({ message: "Gagal memuat data region" });
  }
}

// GET by id
export async function getRegionById(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, name, code, created_at FROM regions WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Region tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    logger.error("❌ getRegionById:", err);
    res.status(500).json({ message: "Gagal memuat data region" });
  }
}

// CREATE
export async function createRegion(req, res) {
  try {
    const { name, code } = req.body;
    if (!name)
      return res.status(400).json({ message: "Nama region wajib diisi" });

    const result = await pool.query(
      "INSERT INTO regions (name, code, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [name, code || null]
    );

    logger.info(`✅ Region dibuat: ${name}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error("❌ createRegion:", err);
    res.status(500).json({ message: "Gagal membuat region" });
  }
}

// UPDATE
export async function updateRegion(req, res) {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const result = await pool.query(
      "UPDATE regions SET name=$1, code=$2 WHERE id=$3 RETURNING *",
      [name, code || null, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Region tidak ditemukan" });

    logger.info(`✅ Region diperbarui: ${name}`);
    res.json(result.rows[0]);
  } catch (err) {
    logger.error("❌ updateRegion:", err);
    res.status(500).json({ message: "Gagal memperbarui region" });
  }
}

// DELETE
export async function deleteRegion(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM regions WHERE id=$1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Region tidak ditemukan" });

    logger.info(`🗑️ Region dihapus ID=${id}`);
    res.json({ message: "Region dihapus" });
  } catch (err) {
    logger.error("❌ deleteRegion:", err);
    res.status(500).json({ message: "Gagal menghapus region" });
  }
}