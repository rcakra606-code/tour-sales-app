/**
 * ==========================================================
 * 📁 routes/documents.js (ESM version)
 * Travel Dashboard Enterprise v5.0
 * ==========================================================
 * Endpoint untuk modul Dokumen:
 * - Ambil semua data dokumen
 * - Tambah dokumen baru
 * - Hapus dokumen berdasarkan ID
 * ==========================================================
 */

import express from "express";
import {
  getDocuments,
  createDocument,
  deleteDocument
} from "../controllers/documentController.js";

const router = express.Router();

// 📋 Ambil semua dokumen
router.get("/", getDocuments);

// 💾 Tambah dokumen baru
router.post("/", createDocument);

// ❌ Hapus dokumen berdasarkan ID
router.delete("/:id", deleteDocument);

export default router;