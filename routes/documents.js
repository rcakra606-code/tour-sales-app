/**
 * ==========================================================
 * routes/documents.js — Travel Dashboard Enterprise v3.9.2
 * ==========================================================
 * ✅ CRUD data Dokumen
 * ✅ Export Excel
 * ✅ Middleware auth & role
 * ==========================================================
 */

const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const { verifyToken } = require("../middleware/authMiddleware");
const roleCheck = require("../middleware/roleCheck");

// ============================================================
// 📘 GET /api/documents
// Ambil semua data dokumen
// ============================================================
router.get("/", verifyToken, documentController.getAllDocuments);

// ============================================================
// 📘 GET /api/documents/:id
// Ambil 1 data dokumen berdasarkan ID
// ============================================================
router.get("/:id", verifyToken, documentController.getDocumentById);

// ============================================================
// 🟢 POST /api/documents
// Tambah data dokumen baru
// ============================================================
router.post("/", verifyToken, roleCheck(["super", "semi"]), documentController.createDocument);

// ============================================================
// 🟡 PUT /api/documents/:id
// Update data dokumen
// ============================================================
router.put("/:id", verifyToken, roleCheck(["super", "semi"]), documentController.updateDocument);

// ============================================================
// 🔴 DELETE /api/documents/:id
// Hapus data dokumen
// ============================================================
router.delete("/:id", verifyToken, roleCheck(["super"]), documentController.deleteDocument);

// ============================================================
// 📤 GET /api/documents/export
// Export data dokumen ke Excel
// ============================================================
router.get("/export", verifyToken, roleCheck(["super", "semi", "basic"]), documentController.exportDocumentReport);

module.exports = router;
